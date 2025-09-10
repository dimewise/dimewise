package paymentmethodsvc

import (
	"context"

	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/app/dto"
	"github.com/dimewise/dimewise/internal/app/mutation"
	"github.com/dimewise/dimewise/internal/app/validate"
	"github.com/dimewise/dimewise/internal/server/middleware"
	"github.com/dimewise/dimewise/internal/server/service"
)

func CreatePaymentMethod(
	ctx context.Context,
	c *config.Config,
	form oapi.PaymentMethodCreate,
) (*oapi.PaymentMethod, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	err := validate.ValidPaymentMethodCreate(form)
	if err != nil {
		return nil, service.NewError(
			service.ErrCodeBadRequest,
			"form is invalid",
			err,
		)
	}

	newPaymentMethod := dto.NewPaymentMethod(user.ID, form)
	insertedPaymentMethod, err := mutation.InsertPaymentMethodByModel(ctx, c.DB(), newPaymentMethod)
	if err != nil {
		return nil, err
	}

	oapiPaymentMethod := dto.TransformModelPaymentMethodToOAPIPaymentMethod(*insertedPaymentMethod)

	return &oapiPaymentMethod, nil
}
