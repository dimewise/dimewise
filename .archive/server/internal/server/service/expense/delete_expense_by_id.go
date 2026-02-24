package expensesvc

import (
	"context"

	"github.com/go-errors/errors"
	"github.com/google/uuid"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/internal/app/mutation"
	"github.com/dimewise/dimewise/internal/server/middleware"
	"github.com/dimewise/dimewise/internal/server/service"
)

func DeleteExpense(
	ctx context.Context,
	c *config.Config,
	targetExpenseID uuid.UUID,
) error {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	err := mutation.DeleteExpenseByID(ctx, c.DB(), user.ID, targetExpenseID)
	if err != nil {
		return err
	}

	return nil
}
