package service

import (
	"context"
	"time"

	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/model"
	"dimewise/internal/repository"
)

// UserRepository is the interface for user data access, shared by UserService and HouseholdService.
type UserRepository interface {
	repository.UserReader
	repository.UserWriter
}

// UserService handles user business logic.
type UserService struct {
	users UserRepository
}

func NewUserService(users UserRepository) *UserService {
	return &UserService{users: users}
}

// UpsertFromClerk creates or updates a user from Clerk authentication data.
func (s *UserService) UpsertFromClerk(
	ctx context.Context,
	clerkID string,
	email string,
	firstName *string,
	lastName *string,
	avatarURL *string,
) (*model.Users, error) {
	now := time.Now()
	user := &model.Users{
		ClerkID:     clerkID,
		Email:       email,
		FirstName:   firstName,
		LastName:    lastName,
		AvatarURL:   avatarURL,
		LastLoginAt: &now,
	}

	result, err := s.users.Upsert(ctx, user)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to upsert user", err)
	}

	return result, nil
}

// UpdateLanguage updates a user's preferred language.
func (s *UserService) UpdateLanguage(
	ctx context.Context,
	userID uuid.UUID,
	language string,
) (*model.Users, error) {
	validLanguages := map[string]bool{"en": true, "ja": true}
	if !validLanguages[language] {
		return nil, NewError(ErrBadRequest, "invalid language: must be 'en' or 'ja'")
	}

	result, err := s.users.UpdateLanguage(ctx, userID, language)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to update language", err)
	}

	return result, nil
}
