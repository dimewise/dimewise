package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/teoyi/dimewise/db/dimewise/public/model"
)

func CreateCategory(accountID uuid.UUID, name string, budget int) *model.Category {
	now := time.Now()
	category := model.Category{
		ID:        uuid.New(),
		AccountID: accountID,
		Name:      name,
		Budget:    int32(budget),
		CreatedAt: now,
		UpdatedAt: now,
	}

	return &category
}
