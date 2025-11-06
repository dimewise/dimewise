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

func GetBudgetOverview(
	ctx context.Context,
	c *config.Config,
	params oapi.GetAnalyticsBudgetOverviewParams,
) (*oapi.BudgetOverview, error) {
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

	// Call repository functions with pre-computed values
	budgetResult, err := repository.GetTotalBudgetByUserID(ctx, c.DB(), user.ID)
	if err != nil {
		return nil, err
	}

	spentResult, err := repository.GetTotalSpentByUserIDAndDateRange(ctx, c.DB(), user.ID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	// Handle null values (default to 0 for budget/spent if nil)
	var totalBudget int64
	if budgetResult != nil && budgetResult.Sum != nil {
		totalBudget = *budgetResult.Sum
	}

	var totalSpent int64
	if spentResult != nil && spentResult.Sum != nil {
		totalSpent = *spentResult.Sum
	}

	// Calculate remaining budget
	remainingBudget := totalBudget - totalSpent

	// Convert CurrencyType to string
	currency := string(user.Currency)

	// Build DTO with all computed values
	budgetOverview := dto.BudgetOverview{
		TotalBudget:     int(totalBudget),
		TotalSpent:      int(totalSpent),
		RemainingBudget: int(remainingBudget),
		Currency:        currency,
		Month:           int(month),
		Year:            year,
	}

	// Transform to OAPI
	oapiBudgetOverview := dto.TransformBudgetOverviewToOAPI(budgetOverview)
	return &oapiBudgetOverview, nil
}
