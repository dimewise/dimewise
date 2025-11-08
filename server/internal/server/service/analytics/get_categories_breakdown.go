package analyticsvc

import (
	"context"
	"time"

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

	// Extract and default month/year from params
	month := time.Now().Month()
	year := time.Now().Year()
	if params.Month != nil {
		month = time.Month(*params.Month)
	}
	if params.Year != nil {
		year = *params.Year
	}

	// Calculate date range for the month
	startDate := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	var endDate time.Time
	if month == 12 {
		endDate = time.Date(year+1, 1, 1, 0, 0, 0, 0, time.UTC)
	} else {
		endDate = time.Date(year, month+1, 1, 0, 0, 0, 0, time.UTC)
	}

	// Call repository function with pre-computed values
	results, err := repository.GetCategoriesBreakdown(ctx, c.DB(), user.ID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	// Convert raw DB results to DTOs
	breakdown := make([]dto.CategoryBreakdown, len(*results))
	for i, result := range *results {
		remaining := result.Budget - result.Spent
		breakdown[i] = dto.CategoryBreakdown{
			CategoryID:    result.ID,
			CategoryTitle: result.Title,
			Budget:        int(result.Budget),
			Spent:         int(result.Spent),
			Remaining:     int(remaining),
		}
	}

	// Transform to OAPI
	oapiCategoriesBreakdown := dto.BatchTransformCategoryBreakdownToOAPI(breakdown)
	return &oapiCategoriesBreakdown, nil
}
