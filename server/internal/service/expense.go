package service

import (
	"context"
	"errors"
	"time"

	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/model"
	"dimewise/internal/repository"
)

// ExpenseRepository is the interface the service depends on.
type ExpenseRepository interface {
	repository.ExpenseReader
	repository.ExpenseWriter
}

// ExpenseService handles expense business logic.
type ExpenseService struct {
	expenses   ExpenseRepository
	households HouseholdRepository
}

func NewExpenseService(expenses ExpenseRepository, households HouseholdRepository) *ExpenseService {
	return &ExpenseService{
		expenses:   expenses,
		households: households,
	}
}

func (s *ExpenseService) List(
	ctx context.Context,
	userID uuid.UUID,
	filter repository.ExpenseFilter,
) ([]repository.ExpenseWithSplits, int, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, 0, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, 0, WrapError(ErrInternal, "failed to get household", err)
	}

	expenses, total, err := s.expenses.List(ctx, household.ID, filter)
	if err != nil {
		return nil, 0, WrapError(ErrInternal, "failed to list expenses", err)
	}

	return expenses, total, nil
}

func (s *ExpenseService) GetByID(
	ctx context.Context,
	userID uuid.UUID,
	expenseID uuid.UUID,
) (*repository.ExpenseWithSplits, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	expense, err := s.expenses.GetByID(ctx, expenseID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "expense not found")
		}

		return nil, WrapError(ErrInternal, "failed to get expense", err)
	}

	if expense.HouseholdID != household.ID {
		return nil, NewError(ErrForbidden, "expense does not belong to your household")
	}

	return expense, nil
}

func (s *ExpenseService) Create(
	ctx context.Context,
	userID uuid.UUID,
	paidBy uuid.UUID,
	categoryID *uuid.UUID,
	title string,
	amount int64,
	notes *string,
	incurredAt time.Time,
	splitInputs []SplitInput,
) (*repository.ExpenseWithSplits, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	if amount <= 0 {
		return nil, NewError(ErrBadRequest, "amount must be positive")
	}

	if len(splitInputs) == 0 {
		return nil, NewError(ErrBadRequest, "at least one split is required")
	}

	// Validate splits sum to total amount
	if err := validateSplits(amount, splitInputs); err != nil {
		return nil, err
	}

	expense := &model.Expenses{
		HouseholdID:      household.ID,
		BudgetCategoryID: categoryID,
		PaidBy:           paidBy,
		LoggedBy:         userID,
		Title:            title,
		Amount:           amount,
		Notes:            notes,
		IncurredAt:       incurredAt,
	}

	splits := make([]model.ExpenseSplits, len(splitInputs))
	for i, si := range splitInputs {
		splits[i] = model.ExpenseSplits{
			UserID: si.UserID,
			Amount: si.Amount,
		}
	}

	created, err := s.expenses.Create(ctx, expense, splits)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to create expense", err)
	}

	return created, nil
}

func (s *ExpenseService) Update(
	ctx context.Context,
	userID uuid.UUID,
	expenseID uuid.UUID,
	paidBy *uuid.UUID,
	categoryID *uuid.UUID,
	title *string,
	amount *int64,
	notes *string,
	incurredAt *time.Time,
	splitInputs []SplitInput,
) (*repository.ExpenseWithSplits, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	existing, err := s.expenses.GetByID(ctx, expenseID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "expense not found")
		}

		return nil, WrapError(ErrInternal, "failed to get expense", err)
	}

	if existing.HouseholdID != household.ID {
		return nil, NewError(ErrForbidden, "expense does not belong to your household")
	}

	// Apply partial updates
	if paidBy != nil {
		existing.PaidBy = *paidBy
	}

	if categoryID != nil {
		existing.BudgetCategoryID = categoryID
	}

	if title != nil {
		existing.Title = *title
	}

	if amount != nil {
		if *amount <= 0 {
			return nil, NewError(ErrBadRequest, "amount must be positive")
		}

		existing.Amount = *amount
	}

	if notes != nil {
		existing.Notes = notes
	}

	if incurredAt != nil {
		existing.IncurredAt = *incurredAt
	}

	// If splits are provided, validate and replace
	var splits []model.ExpenseSplits
	if splitInputs != nil {
		if len(splitInputs) == 0 {
			return nil, NewError(ErrBadRequest, "at least one split is required")
		}

		if err := validateSplits(existing.Amount, splitInputs); err != nil {
			return nil, err
		}

		splits = make([]model.ExpenseSplits, len(splitInputs))
		for i, si := range splitInputs {
			splits[i] = model.ExpenseSplits{
				UserID: si.UserID,
				Amount: si.Amount,
			}
		}
	} else {
		// Keep existing splits
		splits = existing.Splits
	}

	updated, err := s.expenses.Update(ctx, &existing.Expenses, splits)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to update expense", err)
	}

	return updated, nil
}

func (s *ExpenseService) Delete(
	ctx context.Context,
	userID uuid.UUID,
	expenseID uuid.UUID,
) error {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return NewError(ErrNotFound, "user does not belong to any household")
		}

		return WrapError(ErrInternal, "failed to get household", err)
	}

	existing, err := s.expenses.GetByID(ctx, expenseID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return NewError(ErrNotFound, "expense not found")
		}

		return WrapError(ErrInternal, "failed to get expense", err)
	}

	if existing.HouseholdID != household.ID {
		return NewError(ErrForbidden, "expense does not belong to your household")
	}

	err = s.expenses.Delete(ctx, expenseID)
	if err != nil {
		return WrapError(ErrInternal, "failed to delete expense", err)
	}

	return nil
}

// SplitInput represents a split amount for a user.
type SplitInput struct {
	UserID uuid.UUID
	Amount int64
}

func validateSplits(totalAmount int64, splits []SplitInput) *Error {
	var splitSum int64
	for _, s := range splits {
		if s.Amount < 0 {
			return NewError(ErrBadRequest, "split amount cannot be negative")
		}

		splitSum += s.Amount
	}

	if splitSum != totalAmount {
		return NewError(ErrBadRequest, "split amounts must sum to the total expense amount")
	}

	return nil
}
