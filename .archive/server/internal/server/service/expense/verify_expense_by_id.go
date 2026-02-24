package expensesvc

import (
	"context"

	"github.com/go-errors/errors"
	"github.com/google/uuid"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/app/dto"
	"github.com/dimewise/dimewise/internal/app/mutation"
	"github.com/dimewise/dimewise/internal/app/repository"
	"github.com/dimewise/dimewise/internal/server/middleware"
	"github.com/dimewise/dimewise/internal/server/service"
)

func VerifyExpense(
	ctx context.Context,
	c *config.Config,
	targetExpenseID uuid.UUID,
) (*oapi.ExpenseWithDetails, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	expense, err := repository.GetExpenseByID(ctx, c.DB(), user.ID, targetExpenseID)
	if err != nil {
		var re *repository.Error
		if errors.As(err, &re) {
			switch re.Code {
			case repository.ErrCodeNotFound:
				return nil, service.NewError(service.ErrCodeNotFound, "expense not found", err)
			default:
				return nil, err
			}
		}
		return nil, err
	}

	updatedExpense := dto.VerifyExpense(*expense)
	savedExpense, err := mutation.UpdateExpenseByModel(ctx, c.DB(), updatedExpense)
	if err != nil {
		return nil, err
	}

	// Get full expense details with category and payment method
	expenseFull, err := repository.GetExpenseFullByID(ctx, c.DB(), user.ID, savedExpense.ID)
	if err != nil {
		return nil, err
	}

	oapiExpense := dto.TransformExpenseFullToOAPIExpenseWithDetails(*expenseFull)

	return &oapiExpense, nil
}
