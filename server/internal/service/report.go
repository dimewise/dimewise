package service

import (
	"context"
	"errors"
	"sort"
	"time"

	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/model"
	"dimewise/internal/repository"
)

// ReportRepository is the interface the service depends on.
type ReportRepository interface {
	repository.ReportReader
	repository.ReportWriter
}

// ReportService handles monthly report business logic.
type ReportService struct {
	reports    ReportRepository
	expenses   ExpenseRepository
	households HouseholdRepository
	budgets    BudgetRepository
}

func NewReportService(
	reports ReportRepository,
	expenses ExpenseRepository,
	households HouseholdRepository,
	budgets BudgetRepository,
) *ReportService {
	return &ReportService{
		reports:    reports,
		expenses:   expenses,
		households: households,
		budgets:    budgets,
	}
}

func (s *ReportService) List(
	ctx context.Context,
	userID uuid.UUID,
) ([]repository.ReportListItem, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	reports, err := s.reports.ListByHousehold(ctx, household.ID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to list reports", err)
	}

	return reports, nil
}

func (s *ReportService) GetByID(
	ctx context.Context,
	userID uuid.UUID,
	reportID uuid.UUID,
) (*repository.ReportWithDetails, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	report, err := s.reports.GetByID(ctx, reportID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "report not found")
		}

		return nil, WrapError(ErrInternal, "failed to get report", err)
	}

	if report.HouseholdID != household.ID {
		return nil, NewError(ErrForbidden, "report does not belong to your household")
	}

	return report, nil
}

func (s *ReportService) Generate(
	ctx context.Context,
	userID uuid.UUID,
	month, year int,
) (*repository.ReportWithDetails, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	if month < 1 || month > 12 {
		return nil, NewError(ErrBadRequest, "month must be between 1 and 12")
	}

	if year < 2020 {
		return nil, NewError(ErrBadRequest, "year must be 2020 or later")
	}

	// Delete existing report for this month (allows re-generation)
	err = s.reports.DeleteByMonthYear(ctx, household.ID, month, year)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to delete existing report", err)
	}

	// Calculate month boundaries
	monthStart := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	monthEnd := monthStart.AddDate(0, 1, 0)

	// Get all members
	members, err := s.households.GetMembers(ctx, household.ID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get household members", err)
	}

	memberNameMap := make(map[uuid.UUID]string, len(members))
	for _, m := range members {
		name := ""
		if m.User.FirstName != nil {
			name = *m.User.FirstName
		}

		if m.User.LastName != nil {
			if name != "" {
				name += " "
			}

			name += *m.User.LastName
		}

		if name == "" {
			name = m.User.Email
		}

		memberNameMap[m.UserID] = name
	}

	// Get all expenses for the month with splits
	expenseList, _, err := s.expenses.List(ctx, household.ID, repository.ExpenseFilter{
		From:  &monthStart,
		To:    &monthEnd,
		Limit: 10000,
	})
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to list expenses", err)
	}

	// Get budget categories for category breakdown
	categories, err := s.budgets.ListByHousehold(ctx, household.ID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to list budget categories", err)
	}

	categoryNameMap := make(map[uuid.UUID]string, len(categories))
	categoryBudgetMap := make(map[uuid.UUID]int64, len(categories))

	for _, c := range categories {
		categoryNameMap[c.ID] = c.Name
		categoryBudgetMap[c.ID] = c.Amount
	}

	// Get spending by category
	catSpending, err := s.expenses.GetSpendingByCategory(ctx, household.ID, monthStart, monthEnd)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get category spending", err)
	}

	catSpendingMap := make(map[uuid.UUID]int64, len(catSpending))
	for _, cs := range catSpending {
		catSpendingMap[cs.BudgetCategoryID] = cs.Spent
	}

	// Get per-user paid and owed
	paid, err := s.expenses.GetUserSpending(ctx, household.ID, monthStart, monthEnd)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get user spending", err)
	}

	owed, err := s.expenses.GetUserSplits(ctx, household.ID, monthStart, monthEnd)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get user splits", err)
	}

	// Build report data
	var totalAmount int64
	for _, exp := range expenseList {
		totalAmount += exp.Amount
	}

	// Build member summaries (all members, even zero-activity)
	memberSummaries := make([]model.ReportMemberSummaries, 0, len(members))
	for _, m := range members {
		ms := model.ReportMemberSummaries{
			UserID:     m.UserID,
			MemberName: memberNameMap[m.UserID],
			TotalPaid:  paid[m.UserID],
			TotalOwed:  owed[m.UserID],
			NetBalance: paid[m.UserID] - owed[m.UserID],
		}
		memberSummaries = append(memberSummaries, ms)
	}

	// Build category breakdowns
	categoryBreakdowns := make([]model.ReportCategoryBreakdowns, 0, len(categories))

	for _, c := range categories {
		cb := model.ReportCategoryBreakdowns{
			CategoryName: c.Name,
			BudgetAmount: c.Amount,
			TotalSpent:   catSpendingMap[c.ID],
		}
		categoryBreakdowns = append(categoryBreakdowns, cb)
	}

	// Build line items with splits
	lineItems := make([]model.ReportLineItems, 0, len(expenseList))
	lineItemSplits := make(map[int][]model.ReportLineItemSplits, len(expenseList))

	for i, exp := range expenseList {
		var catName *string
		if exp.BudgetCategoryID != nil {
			if name, ok := categoryNameMap[*exp.BudgetCategoryID]; ok {
				catName = &name
			}
		}

		li := model.ReportLineItems{
			ExpenseID:    &exp.ID,
			ExpenseTitle: exp.Title,
			CategoryName: catName,
			PaidByUserID: exp.PaidBy,
			PaidByName:   memberNameMap[exp.PaidBy],
			Amount:       exp.Amount,
			IncurredAt:   exp.IncurredAt,
			Notes:        exp.Notes,
		}
		lineItems = append(lineItems, li)

		splits := make([]model.ReportLineItemSplits, 0, len(exp.Splits))
		for _, split := range exp.Splits {
			splits = append(splits, model.ReportLineItemSplits{
				UserID:     split.UserID,
				MemberName: memberNameMap[split.UserID],
				Amount:     split.Amount,
			})
		}

		lineItemSplits[i] = splits
	}

	// Calculate transfers (debt simplification)
	transfers := calculateTransfers(paid, owed, memberNameMap)

	// Create the report
	input := &repository.ReportCreateInput{
		Report: model.Reports{
			HouseholdID:   household.ID,
			Month:         int32(month),
			Year:          int32(year),
			TotalExpenses: int32(len(expenseList)),
			TotalAmount:   totalAmount,
		},
		MemberSummaries:    memberSummaries,
		CategoryBreakdowns: categoryBreakdowns,
		LineItems:          lineItems,
		LineItemSplits:     lineItemSplits,
		Transfers:          transfers,
	}

	created, err := s.reports.Create(ctx, input)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to create report", err)
	}

	return created, nil
}

func (s *ReportService) MarkTransferPaid(
	ctx context.Context,
	userID uuid.UUID,
	transferID uuid.UUID,
) (*model.ReportTransfers, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	transfer, err := s.reports.GetTransferByID(ctx, transferID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "transfer not found")
		}

		return nil, WrapError(ErrInternal, "failed to get transfer", err)
	}

	// Verify the transfer belongs to the user's household
	report, err := s.reports.GetByID(ctx, transfer.ReportID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get report", err)
	}

	if report.HouseholdID != household.ID {
		return nil, NewError(ErrForbidden, "transfer does not belong to your household")
	}

	// Only the household owner can manage transfer payment status
	if household.OwnerID != userID {
		return nil, NewError(ErrForbidden, "only the household owner can mark transfers as paid")
	}

	if transfer.PaidAt != nil {
		return nil, NewError(ErrConflict, "transfer is already marked as paid")
	}

	updated, err := s.reports.MarkTransferPaid(ctx, transferID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to mark transfer as paid", err)
	}

	return updated, nil
}

func (s *ReportService) UnmarkTransferPaid(
	ctx context.Context,
	userID uuid.UUID,
	transferID uuid.UUID,
) (*model.ReportTransfers, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	transfer, err := s.reports.GetTransferByID(ctx, transferID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "transfer not found")
		}

		return nil, WrapError(ErrInternal, "failed to get transfer", err)
	}

	// Verify the transfer belongs to the user's household
	report, err := s.reports.GetByID(ctx, transfer.ReportID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get report", err)
	}

	if report.HouseholdID != household.ID {
		return nil, NewError(ErrForbidden, "transfer does not belong to your household")
	}

	// Only the household owner can manage transfer payment status
	if household.OwnerID != userID {
		return nil, NewError(ErrForbidden, "only the household owner can undo transfer payments")
	}

	if transfer.PaidAt == nil {
		return nil, NewError(ErrConflict, "transfer is not marked as paid")
	}

	updated, err := s.reports.UnmarkTransferPaid(ctx, transferID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to unmark transfer as paid", err)
	}

	return updated, nil
}

// calculateTransfers uses debt simplification to minimize the number of transfers.
func calculateTransfers(
	paid, owed map[uuid.UUID]int64,
	nameMap map[uuid.UUID]string,
) []model.ReportTransfers {
	// Collect all unique users
	userSet := make(map[uuid.UUID]struct{})
	for uid := range paid {
		userSet[uid] = struct{}{}
	}

	for uid := range owed {
		userSet[uid] = struct{}{}
	}

	// Calculate net balance: positive = owed money, negative = owes money
	type balance struct {
		userID uuid.UUID
		net    int64
	}

	var balances []balance
	for uid := range userSet {
		net := paid[uid] - owed[uid]
		if net != 0 {
			balances = append(balances, balance{userID: uid, net: net})
		}
	}

	// Sort: debtors (negative) first, then creditors (positive)
	sort.Slice(balances, func(i, j int) bool {
		return balances[i].net < balances[j].net
	})

	// Two-pointer approach for debt simplification
	var transfers []model.ReportTransfers

	i := 0
	j := len(balances) - 1

	for i < j {
		debtor := balances[i]   // negative balance (owes money)
		creditor := balances[j] // positive balance (is owed money)

		amount := min(-debtor.net, creditor.net)
		if amount > 0 {
			transfers = append(transfers, model.ReportTransfers{
				FromUserID: debtor.userID,
				ToUserID:   creditor.userID,
				FromName:   nameMap[debtor.userID],
				ToName:     nameMap[creditor.userID],
				Amount:     amount,
			})
		}

		balances[i].net += amount
		balances[j].net -= amount

		if balances[i].net == 0 {
			i++
		}

		if balances[j].net == 0 {
			j--
		}
	}

	return transfers
}
