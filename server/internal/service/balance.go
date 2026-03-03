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

	// Get per-user paid and owed amounts for the month
	paid, err := s.expenses.GetUserSpending(ctx, household.ID, monthStart, monthEnd)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get user spending", err)
	}

	owed, err := s.expenses.GetUserSplits(ctx, household.ID, monthStart, monthEnd)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get user splits", err)
	}

	// Calculate net balance per user: positive = owed money, negative = owes money
	netBalances := make(map[uuid.UUID]int64)

	for uid := range paid {
		netBalances[uid] = paid[uid]
	}

	for uid, amount := range owed {
		netBalances[uid] -= amount
	}

	// Adjust for paid report transfers: settled debts reduce outstanding balances
	paidTransfers, err := s.reports.GetPaidTransfersForMonth(ctx, household.ID, month, year)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get paid transfers", err)
	}

	for _, t := range paidTransfers {
		// from_user paid to_user: from_user's debt decreases, to_user's credit decreases
		netBalances[t.FromUserID] += t.Amount
		netBalances[t.ToUserID] -= t.Amount
	}

	// Run debt simplification and extract current user's balances
	transfers := simplifyDebts(netBalances)
	balances, netBalance := extractUserBalances(transfers, userID, memberNameMap)

	return &BalanceSummary{
		Month:      month,
		Year:       year,
		NetBalance: netBalance,
		Balances:   balances,
	}, nil
}

// extractUserBalances filters debt transfers for the given user and returns per-member balances.
func extractUserBalances(
	transfers []debtTransfer,
	userID uuid.UUID,
	nameMap map[uuid.UUID]string,
) ([]MemberBalance, int64) {
	var balances []MemberBalance

	var netBalance int64

	for _, t := range transfers {
		if t.fromUserID == userID {
			balances = append(balances, MemberBalance{
				UserID:     t.toUserID,
				MemberName: nameMap[t.toUserID],
				Amount:     -t.amount,
			})
			netBalance -= t.amount
		} else if t.toUserID == userID {
			balances = append(balances, MemberBalance{
				UserID:     t.fromUserID,
				MemberName: nameMap[t.fromUserID],
				Amount:     t.amount,
			})
			netBalance += t.amount
		}
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

// debtTransfer is a simplified debt transfer (not persisted, just for calculation).
type debtTransfer struct {
	fromUserID uuid.UUID
	toUserID   uuid.UUID
	amount     int64
}

// simplifyDebts uses the two-pointer technique to minimize transfer count.
func simplifyDebts(netBalances map[uuid.UUID]int64) []debtTransfer {
	type balance struct {
		userID uuid.UUID
		net    int64
	}

	var balances []balance
	for uid, net := range netBalances {
		if net != 0 {
			balances = append(balances, balance{userID: uid, net: net})
		}
	}

	sort.Slice(balances, func(i, j int) bool {
		return balances[i].net < balances[j].net
	})

	var transfers []debtTransfer

	i := 0
	j := len(balances) - 1

	for i < j {
		debtor := balances[i]
		creditor := balances[j]

		amount := min(-debtor.net, creditor.net)
		if amount > 0 {
			transfers = append(transfers, debtTransfer{
				fromUserID: debtor.userID,
				toUserID:   creditor.userID,
				amount:     amount,
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
