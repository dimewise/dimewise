package expensesvc

import (
	"context"

	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/app/dto"
	"github.com/dimewise/dimewise/internal/app/repository"
	"github.com/dimewise/dimewise/internal/server/middleware"
	"github.com/dimewise/dimewise/internal/server/service"
)

func GetExpenses(
	ctx context.Context,
	c *config.Config,
	params oapi.GetExpensesParams,
) (*[]oapi.ExpenseWithDetails, *oapi.Pagination, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return nil, nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	expenseFull, pagination, err := repository.GetFullExpensesByUserID(ctx, c.DB(), user.ID, params)
	if err != nil {
		return nil, nil, err
	}

	oapiExpensesWithDetails := dto.BatchTransformDTOExpenseFullToOAPIExpenseWithDetails(
		*expenseFull,
	)
	oapiPagination := dto.TransformCursorPaginationToOAPI(*pagination)

	return &oapiExpensesWithDetails, &oapiPagination, nil
}
