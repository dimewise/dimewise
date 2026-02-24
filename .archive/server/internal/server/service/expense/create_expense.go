package expensesvc

import (
	"context"

	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/app/dto"
	"github.com/dimewise/dimewise/internal/app/mutation"
	"github.com/dimewise/dimewise/internal/app/repository"
	"github.com/dimewise/dimewise/internal/app/validate"
	"github.com/dimewise/dimewise/internal/server/middleware"
	"github.com/dimewise/dimewise/internal/server/service"
)

func CreateExpense(
	ctx context.Context,
	c *config.Config,
	form oapi.ExpenseCreate,
) (*oapi.ExpenseWithDetails, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	err := validate.ValidExpenseCreate(form)
	if err != nil {
		return nil, service.NewError(
			service.ErrCodeBadRequest,
			"form is invalid",
			err,
		)
	}

	newExpense := dto.NewExpense(user.ID, form)
	insertedExpense, err := mutation.InsertExpenseByModel(ctx, c.DB(), newExpense)
	if err != nil {
		return nil, err
	}

	// Get full expense details with category and payment method
	expenseFull, err := repository.GetExpenseFullByID(ctx, c.DB(), user.ID, insertedExpense.ID)
	if err != nil {
		return nil, err
	}

	oapiExpense := dto.TransformExpenseFullToOAPIExpenseWithDetails(*expenseFull)

	return &oapiExpense, nil
}
