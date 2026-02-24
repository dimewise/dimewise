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

func GetRecentTransactions(
	ctx context.Context,
	c *config.Config,
	params oapi.GetAnalyticsRecentTransactionsParams,
) (*[]oapi.ExpenseWithDetails, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	// Extract and handle default limit
	limit := 10
	if params.Limit != nil {
		limit = *params.Limit
	}

	// Extract and handle month/year (if provided)
	var startDate *time.Time
	var endDate *time.Time
	if params.Month != nil && params.Year != nil {
		// Frontend sends 1-based months (1-12), use directly
		month := time.Month(*params.Month)
		year := *params.Year

		// Calculate date range for the month
		start := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
		var end time.Time
		if month == 12 {
			end = time.Date(year+1, 1, 1, 0, 0, 0, 0, time.UTC)
		} else {
			end = time.Date(year, month+1, 1, 0, 0, 0, 0, time.UTC)
		}

		startDate = &start
		endDate = &end
	}

	// Call repository function with explicit parameters
	recentExpenses, err := repository.GetRecentTransactions(
		ctx,
		c.DB(),
		user.ID,
		limit,
		startDate,
		endDate,
	)
	if err != nil {
		return nil, err
	}

	// Transform to OAPI
	oapiExpenses := dto.BatchTransformDTOExpenseFullToOAPIExpenseWithDetails(*recentExpenses)

	return &oapiExpenses, nil
}
