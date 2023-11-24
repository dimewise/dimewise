package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/teoyi/dimewise/db/dimewise/public/model"
)

func CreateAccountByExternalID(externalID string) *model.Account {
	now := time.Now()
	account := model.Account{
		ID:         uuid.New(),
		ExternalID: externalID,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	return &account
}
