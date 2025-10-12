package dto

import (
	"time"

	"github.com/google/uuid"

	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/generated/oapi"
)

func NewUser(clerkID string, form oapi.UserCreate) model.User {
	now := time.Now()

	newUser := model.User{
		ID:                uuid.New(),
		ClerkID:           clerkID,
		Currency:          model.CurrencyType(form.Currency),
		PreferredLanguage: model.SupportedLanguage(form.PreferredLanguage),
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	return newUser
}

func UpdateUserByUpdateForm(user model.User, form oapi.UserUpdate) model.User {
	now := time.Now()

	updatedUser := user
	updatedUser.Currency = model.CurrencyType(form.Currency)
	updatedUser.PreferredLanguage = model.SupportedLanguage(form.PreferredLanguage)
	updatedUser.UpdatedAt = now

	return updatedUser
}

func TransformModelUserToOAPIUser(user model.User) oapi.User {
	return oapi.User{
		Id:                user.ID,
		Currency:          oapi.CurrencyType(user.Currency),
		PreferredLanguage: oapi.SupportedLanguage(user.PreferredLanguage),
		CreatedAt:         user.CreatedAt,
		UpdatedAt:         user.UpdatedAt,
	}
}
