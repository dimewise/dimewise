package analyticsvc

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

func GetCategoriesBreakdown(
	ctx context.Context,
	c *config.Config,
	params oapi.GetAnalyticsCategoriesBreakdownParams,
) (*[]oapi.CategoryBreakdown, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	categoriesBreakdown, err := repository.GetCategoriesBreakdown(ctx, c.DB(), user.ID, params)
	if err != nil {
		return nil, err
	}

	oapiCategoriesBreakdown := dto.BatchTransformCategoryBreakdownToOAPI(*categoriesBreakdown)
	return &oapiCategoriesBreakdown, nil
}
