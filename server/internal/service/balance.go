package service

import (
	"context"
	"errors"
	"sort"
	"time"

	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"
)

// BalanceService handles live balance calculations.
type BalanceService struct {
	expenses   ExpenseRepository
	households HouseholdRepository
	reports    ReportRepository
}

func NewBalanceService(
	expenses ExpenseRepository,
	households HouseholdRepository,
	reports ReportRepository,
) *BalanceService {
	return &BalanceService{
		expenses:   expenses,
		households: households,
		reports:    reports,
	}
}

// MemberBalance represents the current user's balance against another member.
type MemberBalance struct {
	UserID     uuid.UUID
	MemberName string
	Amount     int64 // positive = they owe you, negative = you owe them
}

// BalanceSummary is the result of a balance calculation.
type BalanceSummary struct {
	Month      int
	Year       int
	NetBalance int64
	Balances   []MemberBalance
}

func (s *BalanceService) GetMyBalances(
	ctx context.Context,
	userID uuid.UUID,
	month, year int,
) (*BalanceSummary, error) {
	now := time.Now().UTC()
	if month == 0 {
		month = int(now.Month())
	}

	if year == 0 {
		year = now.Year()
	}

	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	members, err := s.households.GetMembers(ctx, household.ID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get household members", err)
	}

	memberNameMap := buildMemberNameMap(members)

	// Calculate month boundaries
	monthStart := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	monthEnd := monthStart.AddDate(0, 1, 0)

	// Get pairwise splits: (payer, beneficiary) → total split amount (cross-user only)
	pairwise, err := s.expenses.GetPairwiseSplits(ctx, household.ID, monthStart, monthEnd)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get pairwise splits", err)
	}

	// Build per-member balance for the current user
	// positive = they owe me, negative = I owe them
	perMember := make(map[uuid.UUID]int64)

	for _, ps := range pairwise {
		if ps.PaidBy == userID {
			// I paid, they owe me their split
			perMember[ps.UserID] += ps.Total
		} else if ps.UserID == userID {
			// They paid, I owe them my split
			perMember[ps.PaidBy] -= ps.Total
		}
	}

	// Adjust for paid report transfers
	paidTransfers, err := s.reports.GetPaidTransfersForMonth(ctx, household.ID, month, year)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get paid transfers", err)
	}

	for _, t := range paidTransfers {
		if t.FromUserID == userID {
			// I paid them → my debt decreases (balance goes up)
			perMember[t.ToUserID] += t.Amount
		} else if t.ToUserID == userID {
			// They paid me → their debt decreases (balance goes down)
			perMember[t.FromUserID] -= t.Amount
		}
	}

	balances, netBalance := buildMemberBalances(perMember, memberNameMap)

	return &BalanceSummary{
		Month:      month,
		Year:       year,
		NetBalance: netBalance,
		Balances:   balances,
	}, nil
}

// buildMemberBalances converts the per-member balance map into a sorted slice.
func buildMemberBalances(
	perMember map[uuid.UUID]int64,
	nameMap map[uuid.UUID]string,
) ([]MemberBalance, int64) {
	var balances []MemberBalance

	var netBalance int64

	for uid, amount := range perMember {
		if amount == 0 {
			continue
		}

		balances = append(balances, MemberBalance{
			UserID:     uid,
			MemberName: nameMap[uid],
			Amount:     amount,
		})
		netBalance += amount
	}

	// Sort by absolute amount descending
	sort.Slice(balances, func(i, j int) bool {
		absI := balances[i].Amount
		if absI < 0 {
			absI = -absI
		}

		absJ := balances[j].Amount
		if absJ < 0 {
			absJ = -absJ
		}

		return absI > absJ
	})

	if balances == nil {
		balances = []MemberBalance{}
	}

	return balances, netBalance
}
