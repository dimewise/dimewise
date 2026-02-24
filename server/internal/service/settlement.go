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

// SettlementRepository is the interface the service depends on.
type SettlementRepository interface {
	repository.SettlementReader
	repository.SettlementWriter
}

// SettlementService handles settlement business logic.
type SettlementService struct {
	settlements SettlementRepository
	expenses    ExpenseRepository
	households  HouseholdRepository
}

func NewSettlementService(
	settlements SettlementRepository,
	expenses ExpenseRepository,
	households HouseholdRepository,
) *SettlementService {
	return &SettlementService{
		settlements: settlements,
		expenses:    expenses,
		households:  households,
	}
}

func (s *SettlementService) List(
	ctx context.Context,
	userID uuid.UUID,
) ([]model.Settlements, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	settlements, err := s.settlements.ListByHousehold(ctx, household.ID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to list settlements", err)
	}

	return settlements, nil
}

func (s *SettlementService) GetByID(
	ctx context.Context,
	userID uuid.UUID,
	settlementID uuid.UUID,
) (*repository.SettlementWithTransfers, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	settlement, err := s.settlements.GetByID(ctx, settlementID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "settlement not found")
		}

		return nil, WrapError(ErrInternal, "failed to get settlement", err)
	}

	if settlement.HouseholdID != household.ID {
		return nil, NewError(ErrForbidden, "settlement does not belong to your household")
	}

	return settlement, nil
}

func (s *SettlementService) Generate(
	ctx context.Context,
	userID uuid.UUID,
	month, year int,
) (*repository.SettlementWithTransfers, error) {
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

	// Check if settlement already exists
	_, err = s.settlements.GetByMonthYear(ctx, household.ID, month, year)
	if err == nil {
		return nil, NewError(ErrConflict, "settlement already exists for this month")
	}

	if !errors.Is(err, qrm.ErrNoRows) {
		return nil, WrapError(ErrInternal, "failed to check existing settlement", err)
	}

	// Calculate month boundaries
	monthStart := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	monthEnd := monthStart.AddDate(0, 1, 0)

	// Get what each user paid and what each user owes (splits)
	paid, err := s.expenses.GetUserSpending(ctx, household.ID, monthStart, monthEnd)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get user spending", err)
	}

	owed, err := s.expenses.GetUserSplits(ctx, household.ID, monthStart, monthEnd)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get user splits", err)
	}

	// Calculate net balance for each user: paid - owed
	// Positive = they are owed money, Negative = they owe money
	transfers := calculateTransfers(paid, owed)

	settlement := &model.Settlements{
		HouseholdID: household.ID,
		Month:       int32(month),
		Year:        int32(year),
	}

	created, err := s.settlements.Create(ctx, settlement, transfers)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to create settlement", err)
	}

	return created, nil
}

func (s *SettlementService) MarkTransferPaid(
	ctx context.Context,
	userID uuid.UUID,
	transferID uuid.UUID,
) (*model.SettlementTransfers, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	transfer, err := s.settlements.GetTransferByID(ctx, transferID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "transfer not found")
		}

		return nil, WrapError(ErrInternal, "failed to get transfer", err)
	}

	// Verify the transfer belongs to the user's household
	settlement, err := s.settlements.GetByID(ctx, transfer.SettlementID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to get settlement", err)
	}

	if settlement.HouseholdID != household.ID {
		return nil, NewError(ErrForbidden, "transfer does not belong to your household")
	}

	if transfer.PaidAt != nil {
		return nil, NewError(ErrConflict, "transfer is already marked as paid")
	}

	updated, err := s.settlements.MarkTransferPaid(ctx, transferID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to mark transfer as paid", err)
	}

	return updated, nil
}

// calculateTransfers uses debt simplification to minimize the number of transfers.
// paid: map of userID → total amount they paid
// owed: map of userID → total amount they owe (from splits)
// Returns a list of transfers that settle all debts.
func calculateTransfers(paid, owed map[uuid.UUID]int64) []model.SettlementTransfers {
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
	var transfers []model.SettlementTransfers

	i := 0
	j := len(balances) - 1

	for i < j {
		debtor := balances[i]   // negative balance (owes money)
		creditor := balances[j] // positive balance (is owed money)

		amount := min(-debtor.net, creditor.net)
		if amount > 0 {
			transfers = append(transfers, model.SettlementTransfers{
				FromUserID: debtor.userID,
				ToUserID:   creditor.userID,
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
