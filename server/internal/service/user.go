package service

import (
	"context"
	"time"

	"dimewise/generated/dimewise/public/model"
)

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
