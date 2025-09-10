package validate

import (
	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/generated/oapi"
)

func ValidCategoryCreate(
	form oapi.CategoryCreate,
) error {
	if form.Amount <= 0 {
		return errors.Errorf("amount must be positive")
	}
	if form.Currency == "" {
		return errors.Errorf("currency is required")
	}
	if len(form.Title) == 0 {
		return errors.Errorf("title is required")
	}

	maxTitleLen := 255
	if len(form.Title) > maxTitleLen {
		return errors.Errorf("title length must be no more than 255 characters")
	}

	return nil
}

func ValidCategoryUpdate(
	form oapi.CategoryUpdate,
) error {
	if form.Amount <= 0 {
		return errors.Errorf("amount must be positive")
	}
	if form.Currency == "" {
		return errors.Errorf("currency is required")
	}
	if len(form.Title) == 0 {
		return errors.Errorf("title is required")
	}

	if form.Title != "" {
		maxTitleLen := 255
		if len(form.Title) > maxTitleLen {
			return errors.Errorf("title length must be no more than 255 characters")
		}
	}

	return nil
}
