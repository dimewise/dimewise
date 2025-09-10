package validate

import (
	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/generated/oapi"
)

func ValidPaymentMethodCreate(
	form oapi.PaymentMethodCreate,
) error {
	if len(form.Title) == 0 {
		return errors.Errorf("title is required")
	}
	if form.MethodType == "" {
		return errors.Errorf("method_type is required")
	}

	maxTitleLen := 255
	if len(form.Title) > maxTitleLen {
		return errors.Errorf("title length must be no more than 255 characters")
	}

	return nil
}

func ValidPaymentMethodUpdate(
	form oapi.PaymentMethodUpdate,
) error {
	if len(form.Title) == 0 {
		return errors.Errorf("title is required")
	}
	if form.MethodType == "" {
		return errors.Errorf("method_type is required")
	}

	maxTitleLen := 255
	if len(form.Title) > maxTitleLen {
		return errors.Errorf("title length must be no more than 255 characters")
	}

	return nil
}
