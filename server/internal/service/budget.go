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

// BudgetRepository is the interface the service depends on.
type BudgetRepository interface {
	repository.BudgetReader
	repository.BudgetWriter
}

// BudgetService handles budget category business logic.
type BudgetService struct {
	budgets    BudgetRepository
	households HouseholdRepository
}

func NewBudgetService(budgets BudgetRepository, households HouseholdRepository) *BudgetService {
	return &BudgetService{
		budgets:    budgets,
		households: households,
	}
}

func (s *BudgetService) List(
	ctx context.Context,
	userID uuid.UUID,
) ([]model.BudgetCategories, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	categories, err := s.budgets.ListByHousehold(ctx, household.ID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to list budget categories", err)
	}

	return categories, nil
}

func (s *BudgetService) Create(
	ctx context.Context,
	userID uuid.UUID,
	name string,
	amount int64,
) (*model.BudgetCategories, error) {
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

	category := &model.BudgetCategories{
		HouseholdID: household.ID,
		Name:        name,
		Amount:      amount,
	}

	created, err := s.budgets.Create(ctx, category)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to create budget category", err)
	}

	// Record initial budget in history
	err = s.budgets.RecordHistory(ctx, created.ID, amount, userID)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to record budget history", err)
	}

	return created, nil
}

func (s *BudgetService) Update(
	ctx context.Context,
	userID uuid.UUID,
	budgetID uuid.UUID,
	name *string,
	amount *int64,
	sortOrder *int,
) (*model.BudgetCategories, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	category, err := s.budgets.GetByID(ctx, budgetID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "budget category not found")
		}

		return nil, WrapError(ErrInternal, "failed to get budget category", err)
	}

	// Verify the category belongs to the user's household
	if category.HouseholdID != household.ID {
		return nil, NewError(ErrForbidden, "budget category does not belong to your household")
	}

	amountChanged := false

	if name != nil {
		category.Name = *name
	}

	if amount != nil {
		if *amount <= 0 {
			return nil, NewError(ErrBadRequest, "amount must be positive")
		}

		if category.Amount != *amount {
			amountChanged = true
		}

		category.Amount = *amount
	}

	if sortOrder != nil {
		category.SortOrder = int32(*sortOrder)
	}

	updated, err := s.budgets.Update(ctx, category)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to update budget category", err)
	}

	// Record history only when amount actually changes
	if amountChanged {
		err = s.budgets.RecordHistory(ctx, updated.ID, updated.Amount, userID)
		if err != nil {
			return nil, WrapError(ErrInternal, "failed to record budget history", err)
		}
	}

	return updated, nil
}

func (s *BudgetService) Delete(
	ctx context.Context,
	userID uuid.UUID,
	budgetID uuid.UUID,
) error {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return NewError(ErrNotFound, "user does not belong to any household")
		}

		return WrapError(ErrInternal, "failed to get household", err)
	}

	category, err := s.budgets.GetByID(ctx, budgetID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return NewError(ErrNotFound, "budget category not found")
		}

		return WrapError(ErrInternal, "failed to get budget category", err)
	}

	if category.HouseholdID != household.ID {
		return NewError(ErrForbidden, "budget category does not belong to your household")
	}

	err = s.budgets.SoftDelete(ctx, budgetID)
	if err != nil {
		return WrapError(ErrInternal, "failed to delete budget category", err)
	}

	return nil
}

func (s *BudgetService) GetOverview(
	ctx context.Context,
	userID uuid.UUID,
) (int64, int64, []repository.BudgetCategorySpending, []model.BudgetCategories, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return 0, 0, nil, nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return 0, 0, nil, nil, WrapError(ErrInternal, "failed to get household", err)
	}

	categories, err := s.budgets.ListByHousehold(ctx, household.ID)
	if err != nil {
		return 0, 0, nil, nil, WrapError(ErrInternal, "failed to list budget categories", err)
	}

	// Calculate current month boundaries
	now := time.Now()
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	monthEnd := monthStart.AddDate(0, 1, 0)

	spending, err := s.budgets.GetSpendingByCategory(ctx, household.ID, monthStart, monthEnd)
	if err != nil {
		return 0, 0, nil, nil, WrapError(ErrInternal, "failed to get spending", err)
	}

	var totalBudget int64
	for _, c := range categories {
		totalBudget += c.Amount
	}

	var totalSpent int64
	for _, sp := range spending {
		totalSpent += sp.Spent
	}

	return totalBudget, totalSpent, spending, categories, nil
}
