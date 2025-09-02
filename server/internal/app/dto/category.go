package dto

import (
	"time"

	"github.com/google/uuid"

	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/generated/oapi"
)

func NewCategory(userID uuid.UUID, form oapi.CategoryCreate) model.Category {
	now := time.Now()

	newCategory := model.Category{
		ID:        uuid.New(),
		UserID:    userID,
		Title:     form.Title,
		Amount:    int64(form.Amount),
		Currency:  model.CurrencyType(form.Currency),
		DeletedAt: nil,
		CreatedAt: now,
		UpdatedAt: now,
	}

	return newCategory
}

func TransformModelCategoryToOAPICategory(category model.Category) oapi.Category {
	return oapi.Category{
		Id:        category.ID,
		UserId:    category.UserID,
		Title:     category.Title,
		Amount:    int(category.Amount),
		Currency:  oapi.CurrencyType(category.Currency),
		CreatedAt: category.CreatedAt,
		UpdatedAt: category.UpdatedAt,
		DeletedAt: category.DeletedAt,
	}
}
