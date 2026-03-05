package service

import (
	"bytes"
	"cmp"
	"context"
	"errors"
	"slices"
	"time"

	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"
	"golang.org/x/sync/errgroup"

	"dimewise/generated/dimewise/public/model"
	"dimewise/internal/repository"
)

const (
	maxReportExpenses = 10000 // TODO: implement proper pagination for large households.
	minTrendMonths    = 2
	maxTrendMonths    = 24
	defaultTrendMonth = 12
)

// ReportRepository is the interface the service depends on.
type ReportRepository interface {
	repository.ReportReader
	repository.ReportWriter
}

// MemberSummary is a computed per-member summary (not persisted).
type MemberSummary struct {
	UserID     uuid.UUID
	MemberName string
	TotalPaid  int64
	TotalOwed  int64
	NetBalance int64
}

// CategoryBreakdown is a computed per-category breakdown (not persisted).
type CategoryBreakdown struct {
	CategoryName string
	BudgetAmount int64
	TotalSpent   int64
}

// LineItemSplit is a computed split (not persisted).
type LineItemSplit struct {
	UserID     uuid.UUID
	MemberName string
	Amount     int64
}

// LineItem is a computed line item (not persisted).
type LineItem struct {
	ExpenseID    uuid.UUID
	ExpenseTitle string
	CategoryName *string
	PaidByUserID uuid.UUID
	PaidByName   string
	Amount       int64
	IncurredAt   time.Time
	Notes        *string
	Splits       []LineItemSplit
}

// SettlementTransfer represents a single transfer from one member to another.
type SettlementTransfer struct {
	FromUserID uuid.UUID
	FromName   string
	ToUserID   uuid.UUID
	ToName     string
	Amount     int64
}

// Settlements holds both greedy (optimal) and direct settlement calculations.
type Settlements struct {
	Greedy []SettlementTransfer
	Direct []SettlementTransfer
}

// TrendsResult holds the aggregated trend data.
type TrendsResult struct {
	Months         []repository.MonthlySpendRow
	CategoryTrends map[string][]repository.CategoryTrendRow // keyed by category name
	MemberTrends   map[uuid.UUID]TrendsMember               // keyed by user ID
}

// TrendsMember holds member info and their trend data points.
type TrendsMember struct {
	MemberName string
	Data       []repository.MemberTrendRow
}

// DynamicReport is a fully computed report (not persisted).
type DynamicReport struct {
	Month              int
	Year               int
	TotalExpenses      int
	TotalAmount        int64
	ClosedAt           *time.Time
	MemberSummaries    []MemberSummary
	CategoryBreakdowns []CategoryBreakdown
	LineItems          []LineItem
	Trends             *TrendsResult
	Settlements        *Settlements
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

	reports, err := s.reports.ListAvailableMonths(ctx, household.ID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to list reports", err)
	}

	return reports, nil
}

//nolint:funlen,cyclop // parallel fetch + assembly is clearer as a single function
func (s *ReportService) GetReport(
	ctx context.Context,
	userID uuid.UUID,
	month, year int,
) (*DynamicReport, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	monthStart := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	monthEnd := monthStart.AddDate(0, 1, 0)

	var (
		expenseList    []repository.ExpenseWithSplits
		paid           map[uuid.UUID]int64
		owed           map[uuid.UUID]int64
		catSpending    []repository.BudgetCategorySpending
		members        []repository.HouseholdMemberWithUser
		categories     []model.BudgetCategories
		closedAt       *time.Time
		trends         *TrendsResult
		pairwiseSplits []repository.PairwiseSplit
	)

	g, gCtx := errgroup.WithContext(ctx)

	g.Go(func() error {
		var gErr error
		expenseList, _, gErr = s.expenses.List(gCtx, household.ID, repository.ExpenseFilter{
			From:  &monthStart,
			To:    &monthEnd,
			Limit: maxReportExpenses,
		})

		return gErr
	})

	g.Go(func() error {
		var gErr error
		paid, gErr = s.expenses.GetUserSpending(gCtx, household.ID, monthStart, monthEnd)

		return gErr
	})

	g.Go(func() error {
		var gErr error
		owed, gErr = s.expenses.GetUserSplits(gCtx, household.ID, monthStart, monthEnd)

		return gErr
	})

	g.Go(func() error {
		var gErr error
		catSpending, gErr = s.expenses.GetSpendingByCategory(
			gCtx,
			household.ID,
			monthStart,
			monthEnd,
		)

		return gErr
	})

	g.Go(func() error {
		var gErr error
		members, gErr = s.households.GetMembers(gCtx, household.ID)

		return gErr
	})

	g.Go(func() error {
		var gErr error
		categories, gErr = s.budgets.ListByHousehold(gCtx, household.ID)

		return gErr
	})

	g.Go(func() error {
		var gErr error
		closedAt, gErr = s.reports.GetClosedAt(gCtx, household.ID, month, year)
		if errors.Is(gErr, qrm.ErrNoRows) {
			return nil // no report row yet → not closed
		}

		return gErr
	})

	g.Go(func() error {
		var gErr error
		trends, gErr = s.getTrends(gCtx, household.ID, &month, &year)

		return gErr
	})

	g.Go(func() error {
		var gErr error
		pairwiseSplits, gErr = s.expenses.GetPairwiseSplits(
			gCtx,
			household.ID,
			monthStart,
			monthEnd,
		)

		return gErr
	})

	if gErr := g.Wait(); gErr != nil {
		return nil, WrapError(ErrInternal, "failed to compute report", gErr)
	}

	// If no expenses, return 404
	if len(expenseList) == 0 {
		return nil, NewError(ErrNotFound, "no expenses found for this month")
	}

	memberNameMap := buildMemberNameMap(members)
	categoryNameMap := buildCategoryNameMap(categories)
	catSpendingMap := buildSpendingMap(catSpending)

	totalAmount := sumExpenseAmounts(expenseList)
	memberSummaries := buildDynamicMemberSummaries(members, paid, owed, memberNameMap)
	categoryBreakdowns := buildDynamicCategoryBreakdowns(categories, catSpendingMap)
	lineItems := buildDynamicLineItems(expenseList, categoryNameMap, memberNameMap)
	settlements := computeSettlements(pairwiseSplits, memberNameMap)

	return &DynamicReport{
		Month:              month,
		Year:               year,
		TotalExpenses:      len(expenseList),
		TotalAmount:        totalAmount,
		ClosedAt:           closedAt,
		MemberSummaries:    memberSummaries,
		CategoryBreakdowns: categoryBreakdowns,
		LineItems:          lineItems,
		Trends:             trends,
		Settlements:        settlements,
	}, nil
}

func (s *ReportService) CloseReport(
	ctx context.Context,
	userID uuid.UUID,
	month, year int,
) (*time.Time, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	if household.OwnerID != userID {
		return nil, NewError(ErrForbidden, "only the household owner can close reports")
	}

	closedAt, err := s.reports.Close(ctx, household.ID, month, year)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to close report", err)
	}

	return closedAt, nil
}

func (s *ReportService) ReopenReport(
	ctx context.Context,
	userID uuid.UUID,
	month, year int,
) error {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return NewError(ErrNotFound, "user does not belong to any household")
		}

		return WrapError(ErrInternal, "failed to get household", err)
	}

	if household.OwnerID != userID {
		return NewError(ErrForbidden, "only the household owner can reopen reports")
	}

	if reopenErr := s.reports.Reopen(ctx, household.ID, month, year); reopenErr != nil {
		return WrapError(ErrInternal, "failed to reopen report", reopenErr)
	}

	return nil
}

func (s *ReportService) getTrends(
	ctx context.Context,
	householdID uuid.UUID,
	month *int,
	year *int,
) (*TrendsResult, error) {
	filter := repository.TrendFilter{
		HouseholdID: householdID,
		Limit:       defaultTrendMonth,
		Month:       month,
		Year:        year,
	}

	var (
		monthlySpends []repository.MonthlySpendRow
		catRows       []repository.CategoryTrendRow
		memberRows    []repository.MemberTrendRow
	)

	g, gCtx := errgroup.WithContext(ctx)

	g.Go(func() error {
		var gErr error
		monthlySpends, gErr = s.expenses.GetMonthlySpends(gCtx, filter)

		return gErr
	})

	g.Go(func() error {
		var gErr error
		catRows, gErr = s.expenses.GetCategoryTrends(gCtx, filter)

		return gErr
	})

	g.Go(func() error {
		var gErr error
		memberRows, gErr = s.expenses.GetMemberTrends(gCtx, filter)

		return gErr
	})

	if gErr := g.Wait(); gErr != nil {
		return nil, gErr
	}

	// Reverse monthly spends to oldest-first
	slices.Reverse(monthlySpends)

	// Group category rows by name
	catTrends := make(map[string][]repository.CategoryTrendRow)
	for _, row := range catRows {
		catTrends[row.CategoryName] = append(catTrends[row.CategoryName], row)
	}

	// Group member rows by user ID
	memTrends := make(map[uuid.UUID]TrendsMember)
	for _, row := range memberRows {
		tm := memTrends[row.UserID]
		tm.MemberName = row.MemberName
		tm.Data = append(tm.Data, row)
		memTrends[row.UserID] = tm
	}

	return &TrendsResult{
		Months:         monthlySpends,
		CategoryTrends: catTrends,
		MemberTrends:   memTrends,
	}, nil
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

func buildDynamicMemberSummaries(
	members []repository.HouseholdMemberWithUser,
	paid, owed map[uuid.UUID]int64,
	nameMap map[uuid.UUID]string,
) []MemberSummary {
	summaries := make([]MemberSummary, 0, len(members))

	for _, m := range members {
		summaries = append(summaries, MemberSummary{
			UserID:     m.UserID,
			MemberName: nameMap[m.UserID],
			TotalPaid:  paid[m.UserID],
			TotalOwed:  owed[m.UserID],
			NetBalance: paid[m.UserID] - owed[m.UserID],
		})
	}

	return summaries
}

func buildDynamicCategoryBreakdowns(
	categories []model.BudgetCategories,
	spendingMap map[uuid.UUID]int64,
) []CategoryBreakdown {
	breakdowns := make([]CategoryBreakdown, 0, len(categories))

	for _, c := range categories {
		breakdowns = append(breakdowns, CategoryBreakdown{
			CategoryName: c.Name,
			BudgetAmount: c.Amount,
			TotalSpent:   spendingMap[c.ID],
		})
	}

	return breakdowns
}

func buildDynamicLineItems(
	expenses []repository.ExpenseWithSplits,
	categoryNameMap, memberNameMap map[uuid.UUID]string,
) []LineItem {
	lineItems := make([]LineItem, 0, len(expenses))

	for _, exp := range expenses {
		var catName *string
		if exp.BudgetCategoryID != nil {
			if name, ok := categoryNameMap[*exp.BudgetCategoryID]; ok {
				catName = &name
			}
		}

		splits := make([]LineItemSplit, 0, len(exp.Splits))
		for _, split := range exp.Splits {
			splits = append(splits, LineItemSplit{
				UserID:     split.UserID,
				MemberName: memberNameMap[split.UserID],
				Amount:     split.Amount,
			})
		}

		lineItems = append(lineItems, LineItem{
			ExpenseID:    exp.ID,
			ExpenseTitle: exp.Title,
			CategoryName: catName,
			PaidByUserID: exp.PaidBy,
			PaidByName:   memberNameMap[exp.PaidBy],
			Amount:       exp.Amount,
			IncurredAt:   exp.IncurredAt,
			Notes:        exp.Notes,
			Splits:       splits,
		})
	}

	return lineItems
}

// computeSettlements produces both greedy (optimal) and direct settlements from pairwise splits.
func computeSettlements(
	pairwise []repository.PairwiseSplit,
	nameMap map[uuid.UUID]string,
) *Settlements {
	greedy := computeGreedySettlements(pairwise, nameMap)
	direct := computeDirectSettlements(pairwise, nameMap)

	return &Settlements{
		Greedy: greedy,
		Direct: direct,
	}
}

// computeGreedySettlements uses the classic min-transfers algorithm.
// 1. Compute net balance per member from pairwise splits (paid - owed).
// 2. Split into creditors (+) and debtors (-).
// 3. Sort both descending by absolute value.
// 4. Match largest creditor with largest debtor, settle min(credit, |debt|), repeat.
func computeGreedySettlements(
	pairwise []repository.PairwiseSplit,
	nameMap map[uuid.UUID]string,
) []SettlementTransfer {
	// Net balance: positive = others owe this person, negative = this person owes others.
	net := make(map[uuid.UUID]int64)
	for _, ps := range pairwise {
		// PaidBy paid for UserID's share → UserID owes PaidBy
		net[ps.PaidBy] += ps.Total
		net[ps.UserID] -= ps.Total
	}

	type entry struct {
		uid    uuid.UUID
		amount int64
	}

	var creditors, debtors []entry

	for uid, amount := range net {
		if amount > 0 {
			creditors = append(creditors, entry{uid, amount})
		} else if amount < 0 {
			debtors = append(debtors, entry{uid, -amount}) // store as positive
		}
	}

	// Sort descending by amount
	slices.SortFunc(creditors, func(a, b entry) int { return cmp.Compare(b.amount, a.amount) })
	slices.SortFunc(debtors, func(a, b entry) int { return cmp.Compare(b.amount, a.amount) })

	var transfers []SettlementTransfer

	i, j := 0, 0
	for i < len(creditors) && j < len(debtors) {
		settle := creditors[i].amount
		if debtors[j].amount < settle {
			settle = debtors[j].amount
		}

		transfers = append(transfers, SettlementTransfer{
			FromUserID: debtors[j].uid,
			FromName:   nameMap[debtors[j].uid],
			ToUserID:   creditors[i].uid,
			ToName:     nameMap[creditors[i].uid],
			Amount:     settle,
		})

		creditors[i].amount -= settle
		debtors[j].amount -= settle

		if creditors[i].amount == 0 {
			i++
		}

		if debtors[j].amount == 0 {
			j++
		}
	}

	if transfers == nil {
		transfers = []SettlementTransfer{}
	}

	return transfers
}

// pairKey creates a canonical key for a bilateral pair (smaller UUID first).
type pairKey struct {
	a, b uuid.UUID
}

func newPairKey(x, y uuid.UUID) pairKey {
	if bytes.Compare(x[:], y[:]) < 0 {
		return pairKey{x, y}
	}

	return pairKey{y, x}
}

// computeDirectSettlements nets each (A,B) pair bilaterally.
func computeDirectSettlements(
	pairwise []repository.PairwiseSplit,
	nameMap map[uuid.UUID]string,
) []SettlementTransfer {
	// Accumulate bilateral amounts: positive means b owes a in canonical (a,b) pair.
	bilateral := make(map[pairKey]int64)
	for _, ps := range pairwise {
		pk := newPairKey(ps.PaidBy, ps.UserID)
		if pk.a == ps.PaidBy {
			// PaidBy == a, UserID == b → b owes a → positive
			bilateral[pk] += ps.Total
		} else {
			// PaidBy == b, UserID == a → a owes b → negative
			bilateral[pk] -= ps.Total
		}
	}

	var transfers []SettlementTransfer

	for pk, amount := range bilateral {
		if amount == 0 {
			continue
		}

		var from, to uuid.UUID
		var transferAmount int64

		if amount > 0 {
			// b owes a
			from = pk.b
			to = pk.a
			transferAmount = amount
		} else {
			// a owes b
			from = pk.a
			to = pk.b
			transferAmount = -amount
		}

		transfers = append(transfers, SettlementTransfer{
			FromUserID: from,
			FromName:   nameMap[from],
			ToUserID:   to,
			ToName:     nameMap[to],
			Amount:     transferAmount,
		})
	}

	// Sort by amount descending for consistent output
	slices.SortFunc(
		transfers,
		func(a, b SettlementTransfer) int { return cmp.Compare(b.Amount, a.Amount) },
	)

	if transfers == nil {
		transfers = []SettlementTransfer{}
	}

	return transfers
}
