package dto

import "github.com/google/uuid"

type AuthInfoDto struct {
	ID         uuid.UUID
	ExternalID string
}
