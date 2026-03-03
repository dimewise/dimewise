package service

import (
	"context"
	"crypto/rand"
	"errors"
	"math/big"

	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/model"
	"dimewise/internal/repository"
)

const (
	inviteCodeLength  = 8
	inviteCodeCharset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no I/O/0/1 for readability
)

// HouseholdService handles household business logic.
type HouseholdService struct {
	households HouseholdRepository
	users      UserRepository
}

// HouseholdRepository is the interface the service depends on.
type HouseholdRepository interface {
	repository.HouseholdReader
	repository.HouseholdWriter
}

func NewHouseholdService(households HouseholdRepository, users UserRepository) *HouseholdService {
	return &HouseholdService{
		households: households,
		users:      users,
	}
}

func (s *HouseholdService) Create(
	ctx context.Context,
	userID uuid.UUID,
	name string,
	currency string,
) (*model.Households, []repository.HouseholdMemberWithUser, error) {
	// Check if user already belongs to a household
	_, err := s.households.GetByUserID(ctx, userID)
	if err == nil {
		return nil, nil, NewError(ErrConflict, "user already belongs to a household")
	}

	if !errors.Is(err, qrm.ErrNoRows) {
		return nil, nil, WrapError(ErrInternal, "failed to check existing household", err)
	}

	// Validate currency
	if !isValidCurrency(currency) {
		return nil, nil, NewError(ErrBadRequest, "unsupported currency")
	}

	// Generate invite code
	code, err := generateInviteCode()
	if err != nil {
		return nil, nil, WrapError(ErrInternal, "failed to generate invite code", err)
	}

	household := &model.Households{
		Name:       name,
		Currency:   currency,
		InviteCode: code,
		OwnerID:    userID,
	}

	created, err := s.households.Create(ctx, household)
	if err != nil {
		return nil, nil, WrapError(ErrInternal, "failed to create household", err)
	}

	// Add the owner as the first member
	err = s.households.AddMember(ctx, created.ID, userID)
	if err != nil {
		return nil, nil, WrapError(ErrInternal, "failed to add owner as member", err)
	}

	members, err := s.households.GetMembers(ctx, created.ID)
	if err != nil {
		return nil, nil, WrapError(ErrInternal, "failed to get members", err)
	}

	return created, members, nil
}

func (s *HouseholdService) GetByUser(
	ctx context.Context,
	userID uuid.UUID,
) (*model.Households, []repository.HouseholdMemberWithUser, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, nil, WrapError(ErrInternal, "failed to get household", err)
	}

	members, err := s.households.GetMembers(ctx, household.ID)
	if err != nil {
		return nil, nil, WrapError(ErrInternal, "failed to get members", err)
	}

	return household, members, nil
}

func (s *HouseholdService) Join(
	ctx context.Context,
	userID uuid.UUID,
	inviteCode string,
) (*model.Households, []repository.HouseholdMemberWithUser, error) {
	// Check if user already belongs to a household
	_, err := s.households.GetByUserID(ctx, userID)
	if err == nil {
		return nil, nil, NewError(ErrConflict, "user already belongs to a household")
	}

	if !errors.Is(err, qrm.ErrNoRows) {
		return nil, nil, WrapError(ErrInternal, "failed to check existing household", err)
	}

	// Find household by invite code
	household, err := s.households.GetByInviteCode(ctx, inviteCode)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, nil, NewError(ErrNotFound, "invalid invite code")
		}

		return nil, nil, WrapError(ErrInternal, "failed to find household", err)
	}

	// Add member
	err = s.households.AddMember(ctx, household.ID, userID)
	if err != nil {
		return nil, nil, WrapError(ErrInternal, "failed to join household", err)
	}

	members, err := s.households.GetMembers(ctx, household.ID)
	if err != nil {
		return nil, nil, WrapError(ErrInternal, "failed to get members", err)
	}

	return household, members, nil
}

func (s *HouseholdService) Leave(ctx context.Context, userID uuid.UUID) error {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return NewError(ErrNotFound, "user does not belong to any household")
		}

		return WrapError(ErrInternal, "failed to get household", err)
	}

	// Owner cannot leave their own household
	if household.OwnerID == userID {
		return NewError(ErrForbidden, "owner cannot leave the household, delete it instead")
	}

	err = s.households.RemoveMember(ctx, household.ID, userID)
	if err != nil {
		return WrapError(ErrInternal, "failed to leave household", err)
	}

	return nil
}

func (s *HouseholdService) RemoveMember(
	ctx context.Context,
	ownerID uuid.UUID,
	targetUserID uuid.UUID,
) error {
	household, err := s.households.GetByUserID(ctx, ownerID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return NewError(ErrNotFound, "user does not belong to any household")
		}

		return WrapError(ErrInternal, "failed to get household", err)
	}

	// Only the owner can remove members
	if household.OwnerID != ownerID {
		return NewError(ErrForbidden, "only the household owner can remove members")
	}

	// Cannot remove self
	if ownerID == targetUserID {
		return NewError(ErrBadRequest, "cannot remove yourself, delete the household instead")
	}

	// Verify target is a member
	isMember, err := s.households.IsMember(ctx, household.ID, targetUserID)
	if err != nil {
		return WrapError(ErrInternal, "failed to check membership", err)
	}

	if !isMember {
		return NewError(ErrNotFound, "user is not a member of this household")
	}

	err = s.households.RemoveMember(ctx, household.ID, targetUserID)
	if err != nil {
		return WrapError(ErrInternal, "failed to remove member", err)
	}

	return nil
}

func (s *HouseholdService) RegenerateInviteCode(
	ctx context.Context,
	userID uuid.UUID,
) (*model.Households, error) {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return nil, NewError(ErrNotFound, "user does not belong to any household")
		}

		return nil, WrapError(ErrInternal, "failed to get household", err)
	}

	if household.OwnerID != userID {
		return nil, NewError(
			ErrForbidden,
			"only the household owner can regenerate the invite code",
		)
	}

	code, err := generateInviteCode()
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to generate invite code", err)
	}

	updated, err := s.households.UpdateInviteCode(ctx, household.ID, code)
	if err != nil {
		return nil, WrapError(ErrInternal, "failed to update invite code", err)
	}

	return updated, nil
}

func (s *HouseholdService) Delete(ctx context.Context, userID uuid.UUID) error {
	household, err := s.households.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, qrm.ErrNoRows) {
			return NewError(ErrNotFound, "user does not belong to any household")
		}

		return WrapError(ErrInternal, "failed to get household", err)
	}

	if household.OwnerID != userID {
		return NewError(ErrForbidden, "only the household owner can delete the household")
	}

	err = s.households.Delete(ctx, household.ID)
	if err != nil {
		return WrapError(ErrInternal, "failed to delete household", err)
	}

	return nil
}

func generateInviteCode() (string, error) {
	code := make([]byte, inviteCodeLength)
	charsetLen := big.NewInt(int64(len(inviteCodeCharset)))

	for i := range code {
		n, err := rand.Int(rand.Reader, charsetLen)
		if err != nil {
			return "", err
		}

		code[i] = inviteCodeCharset[n.Int64()]
	}

	return string(code), nil
}

func isValidCurrency(currency string) bool {
	validCurrencies := map[string]bool{
		"USD": true, "EUR": true, "GBP": true, "CAD": true, "AUD": true,
		"SGD": true, "HKD": true, "NZD": true, "CHF": true,
		"JPY": true, "KRW": true,
	}

	return validCurrencies[currency]
}
