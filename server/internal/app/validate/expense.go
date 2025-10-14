package validate

import (
	"github.com/go-errors/errors"
	"github.com/google/uuid"

	"github.com/dimewise/dimewise/generated/oapi"
)

func ValidExpenseCreate(
	form oapi.ExpenseCreate,
) error {
	if form.Amount <= 0 {
		return errors.Errorf("amount must be positive")
	}
	if len(form.Title) == 0 {
		return errors.Errorf("title is required")
	}
	if form.CategoryId == uuid.Nil {
		return errors.Errorf("category_id is required")
	}
	if form.PaymentMethodId == uuid.Nil {
		return errors.Errorf("payment_method_id is required")
	}

	maxTitleLen := 255
	if len(form.Title) > maxTitleLen {
		return errors.Errorf("title length must be no more than 255 characters")
	}

	if form.Description != nil {
		maxDescLen := 1000
		if len(*form.Description) > maxDescLen {
			return errors.Errorf("description length must be no more than 1000 characters")
		}
	}

	return nil
}

func ValidExpenseUpdate(
	form oapi.ExpenseUpdate,
) error {
	if form.Amount <= 0 {
		return errors.Errorf("amount must be positive")
	}
	if len(form.Title) == 0 {
		return errors.Errorf("title is required")
	}
	if form.CategoryId == uuid.Nil {
		return errors.Errorf("category_id is required")
	}
	if form.PaymentMethodId == uuid.Nil {
		return errors.Errorf("payment_method_id is required")
	}

	maxTitleLen := 255
	if len(form.Title) > maxTitleLen {
		return errors.Errorf("title length must be no more than 255 characters")
	}

	if form.Description != nil {
		maxDescLen := 1000
		if len(*form.Description) > maxDescLen {
			return errors.Errorf("description length must be no more than 1000 characters")
		}
	}

	return nil
}
