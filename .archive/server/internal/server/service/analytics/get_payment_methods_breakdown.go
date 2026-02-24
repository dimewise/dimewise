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

func GetPaymentMethodsBreakdown(
	ctx context.Context,
	c *config.Config,
	params oapi.GetAnalyticsPaymentMethodsBreakdownParams,
) (*[]oapi.PaymentMethodBreakdown, error) {
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
	results, err := repository.GetPaymentMethodsBreakdown(ctx, c.DB(), user.ID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	// Convert raw DB results to DTOs
	breakdown := make([]dto.PaymentMethodBreakdown, len(*results))
	for i, result := range *results {
		breakdown[i] = dto.PaymentMethodBreakdown{
			PaymentMethodID:    result.ID,
			PaymentMethodTitle: result.Title,
			TotalSpent:         int(result.TotalSpent),
		}
	}

	// Transform to OAPI
	oapiPaymentMethodsBreakdown := dto.BatchTransformPaymentMethodBreakdownToOAPI(breakdown)
	return &oapiPaymentMethodsBreakdown, nil
}
