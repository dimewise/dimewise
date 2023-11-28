package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/teoyi/dimewise/db/dimewise/public/model"
)

func CreateAccountByExternalIDAndEmail(externalID string, email string) *model.Account {
	now := time.Now()
	account := model.Account{
		ID:         uuid.New(),
		ExternalID: externalID,
		Email:      email,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	return &account
}
