package validate

import (
	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/generated/oapi"
)

func ValidUserCreate(
	form oapi.UserCreate,
) error {
	if form.Currency == "" {
		return errors.Errorf("currency is required")
	}
	if form.PreferredLanguage == "" {
		return errors.Errorf("preferred_language is required")
	}

	return nil
}

func ValidUserUpdate(
	form oapi.UserUpdate,
) error {
	if form.Currency == "" {
		return errors.Errorf("currency is required")
	}
	if form.PreferredLanguage == "" {
		return errors.Errorf("preferred_language is required")
	}

	return nil
}
