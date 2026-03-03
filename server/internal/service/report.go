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

const (
	minReportYear     = 2020
	maxReportExpenses = 10000 // TODO: implement proper pagination for large households.
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

	if year < minReportYear {
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

	memberNameMap := buildMemberNameMap(members)

	// Get all expenses for the month with splits
	expenseList, _, err := s.expenses.List(ctx, household.ID, repository.ExpenseFilter{
		From:  &monthStart,
		To:    &monthEnd,
		Limit: maxReportExpenses,
	})
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to list expenses", err)
	}

	// Get budget categories for category breakdown
	categories, err := s.budgets.ListByHousehold(ctx, household.ID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to list budget categories", err)
	}

	categoryNameMap := buildCategoryNameMap(categories)

	// Get spending by category
	catSpending, err := s.expenses.GetSpendingByCategory(ctx, household.ID, monthStart, monthEnd)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get category spending", err)
	}

	catSpendingMap := buildSpendingMap(catSpending)

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
	totalAmount := sumExpenseAmounts(expenseList)

	memberSummaries := buildMemberSummaries(members, paid, owed, memberNameMap)
	categoryBreakdowns := buildCategoryBreakdowns(categories, catSpendingMap)
	lineItems, lineItemSplits := buildLineItems(expenseList, categoryNameMap, memberNameMap)
	transfers := calculateTransfers(paid, owed, memberNameMap)

	// Create the report
	reportMonth := int32(month)
	reportYear := int32(year)                //nolint:gosec // year is validated >= 2020
	totalExpenses := int32(len(expenseList)) //nolint:gosec // bounded by maxReportExpenses

	input := &repository.ReportCreateInput{
		Report: model.Reports{
			HouseholdID:   household.ID,
			Month:         reportMonth,
			Year:          reportYear,
			TotalExpenses: totalExpenses,
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

func buildCategoryNameMap(categories []model.BudgetCategories) map[uuid.UUID]string {
	nameMap := make(map[uuid.UUID]string, len(categories))
	for _, c := range categories {
		nameMap[c.ID] = c.Name
	}

	return nameMap
}

func buildSpendingMap(spending []repository.BudgetCategorySpending) map[uuid.UUID]int64 {
	m := make(map[uuid.UUID]int64, len(spending))
	for _, cs := range spending {
		m[cs.BudgetCategoryID] = cs.Spent
	}

	return m
}

func sumExpenseAmounts(expenses []repository.ExpenseWithSplits) int64 {
	var total int64
	for _, exp := range expenses {
		total += exp.Amount
	}

	return total
}

func buildMemberNameMap(members []repository.HouseholdMemberWithUser) map[uuid.UUID]string {
	nameMap := make(map[uuid.UUID]string, len(members))

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

		nameMap[m.UserID] = name
	}

	return nameMap
}

func buildMemberSummaries(
	members []repository.HouseholdMemberWithUser,
	paid, owed map[uuid.UUID]int64,
	nameMap map[uuid.UUID]string,
) []model.ReportMemberSummaries {
	summaries := make([]model.ReportMemberSummaries, 0, len(members))

	for _, m := range members {
		summaries = append(summaries, model.ReportMemberSummaries{
			UserID:     m.UserID,
			MemberName: nameMap[m.UserID],
			TotalPaid:  paid[m.UserID],
			TotalOwed:  owed[m.UserID],
			NetBalance: paid[m.UserID] - owed[m.UserID],
		})
	}

	return summaries
}

func buildCategoryBreakdowns(
	categories []model.BudgetCategories,
	spendingMap map[uuid.UUID]int64,
) []model.ReportCategoryBreakdowns {
	breakdowns := make([]model.ReportCategoryBreakdowns, 0, len(categories))

	for _, c := range categories {
		breakdowns = append(breakdowns, model.ReportCategoryBreakdowns{
			CategoryName: c.Name,
			BudgetAmount: c.Amount,
			TotalSpent:   spendingMap[c.ID],
		})
	}

	return breakdowns
}

func buildLineItems(
	expenses []repository.ExpenseWithSplits,
	categoryNameMap, memberNameMap map[uuid.UUID]string,
) ([]model.ReportLineItems, map[int][]model.ReportLineItemSplits) {
	lineItems := make([]model.ReportLineItems, 0, len(expenses))
	lineItemSplits := make(map[int][]model.ReportLineItemSplits, len(expenses))

	for i, exp := range expenses {
		var catName *string
		if exp.BudgetCategoryID != nil {
			if name, ok := categoryNameMap[*exp.BudgetCategoryID]; ok {
				catName = &name
			}
		}

		lineItems = append(lineItems, model.ReportLineItems{
			ExpenseID:    &exp.ID,
			ExpenseTitle: exp.Title,
			CategoryName: catName,
			PaidByUserID: exp.PaidBy,
			PaidByName:   memberNameMap[exp.PaidBy],
			Amount:       exp.Amount,
			IncurredAt:   exp.IncurredAt,
			Notes:        exp.Notes,
		})

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

	return lineItems, lineItemSplits
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
