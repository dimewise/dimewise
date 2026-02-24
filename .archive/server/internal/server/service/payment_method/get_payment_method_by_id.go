package paymentmethodsvc

import (
	"context"

	"github.com/go-errors/errors"
	"github.com/google/uuid"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/app/dto"
	"github.com/dimewise/dimewise/internal/app/repository"
	"github.com/dimewise/dimewise/internal/server/middleware"
	"github.com/dimewise/dimewise/internal/server/service"
)

func GetPaymentMethodByID(
	ctx context.Context,
	c *config.Config,
	targetPaymentMethodID uuid.UUID,
) (*oapi.PaymentMethod, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	paymentMethod, err := repository.GetPaymentMethodByID(
		ctx,
		c.DB(),
		user.ID,
		targetPaymentMethodID,
	)
	if err != nil {
		var re *repository.Error
		if errors.As(err, &re) {
			switch re.Code {
			case repository.ErrCodeNotFound:
				return nil, service.NewError(
					service.ErrCodeNotFound,
					"payment method not found",
					err,
				)
			default:
				return nil, err
			}
		}
		return nil, err
	}

	oapiPaymentMethod := dto.TransformModelPaymentMethodToOAPIPaymentMethod(*paymentMethod)

	return &oapiPaymentMethod, nil
}
