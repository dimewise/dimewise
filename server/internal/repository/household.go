package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/go-jet/jet/v2/postgres"
	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/model"
	"dimewise/generated/dimewise/public/table"
)

// HouseholdMemberWithUser is a joined result of household_members + users.
type HouseholdMemberWithUser struct {
	model.HouseholdMembers
	User model.Users
}

// HouseholdReader defines read operations for households.
type HouseholdReader interface {
	GetByID(ctx context.Context, id uuid.UUID) (*model.Households, error)
	GetByInviteCode(ctx context.Context, code string) (*model.Households, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) (*model.Households, error)
	GetMembers(ctx context.Context, householdID uuid.UUID) ([]HouseholdMemberWithUser, error)
	IsMember(ctx context.Context, householdID, userID uuid.UUID) (bool, error)
}

// HouseholdWriter defines write operations for households.
type HouseholdWriter interface {
	Create(ctx context.Context, household *model.Households) (*model.Households, error)
	AddMember(ctx context.Context, householdID, userID uuid.UUID) error
	RemoveMember(ctx context.Context, householdID, userID uuid.UUID) error
	UpdateInviteCode(
		ctx context.Context,
		householdID uuid.UUID,
		newCode string,
	) (*model.Households, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

// HouseholdRepository implements HouseholdReader and HouseholdWriter.
type HouseholdRepository struct {
	db *sql.DB
}

func NewHouseholdRepository(db *sql.DB) *HouseholdRepository {
	return &HouseholdRepository{db: db}
}

func (r *HouseholdRepository) GetByID(
	ctx context.Context,
	id uuid.UUID,
) (*model.Households, error) {
	var household model.Households

	stmt := postgres.SELECT(table.Households.AllColumns).
		FROM(table.Households).
		WHERE(table.Households.ID.EQ(postgres.UUID(id)))

	err := stmt.QueryContext(ctx, r.db, &household)
	if err != nil {
		return nil, err
	}

	return &household, nil
}

func (r *HouseholdRepository) GetByInviteCode(
	ctx context.Context,
	code string,
) (*model.Households, error) {
	var household model.Households

	stmt := postgres.SELECT(table.Households.AllColumns).
		FROM(table.Households).
		WHERE(table.Households.InviteCode.EQ(postgres.String(code)))

	err := stmt.QueryContext(ctx, r.db, &household)
	if err != nil {
		return nil, err
	}

	return &household, nil
}

func (r *HouseholdRepository) GetByUserID(
	ctx context.Context,
	userID uuid.UUID,
) (*model.Households, error) {
	var household model.Households

	stmt := postgres.SELECT(table.Households.AllColumns).
		FROM(
			table.Households.
				INNER_JOIN(
					table.HouseholdMembers,
					table.HouseholdMembers.HouseholdID.EQ(table.Households.ID),
				),
		).
		WHERE(table.HouseholdMembers.UserID.EQ(postgres.UUID(userID)))

	err := stmt.QueryContext(ctx, r.db, &household)
	if err != nil {
		return nil, err
	}

	return &household, nil
}

func (r *HouseholdRepository) GetMembers(
	ctx context.Context,
	householdID uuid.UUID,
) ([]HouseholdMemberWithUser, error) {
	var members []HouseholdMemberWithUser

	stmt := postgres.SELECT(
		table.HouseholdMembers.AllColumns,
		table.Users.AllColumns,
	).FROM(
		table.HouseholdMembers.
			INNER_JOIN(table.Users, table.Users.ID.EQ(table.HouseholdMembers.UserID)),
	).WHERE(
		table.HouseholdMembers.HouseholdID.EQ(postgres.UUID(householdID)),
	).ORDER_BY(
		table.HouseholdMembers.JoinedAt.ASC(),
	)

	err := stmt.QueryContext(ctx, r.db, &members)
	if err != nil {
		return nil, fmt.Errorf("failed to get household members: %w", err)
	}

	return members, nil
}

func (r *HouseholdRepository) IsMember(
	ctx context.Context,
	householdID, userID uuid.UUID,
) (bool, error) {
	var count struct {
		Count int64
	}

	stmt := postgres.SELECT(postgres.COUNT(table.HouseholdMembers.ID).AS("count")).
		FROM(table.HouseholdMembers).
		WHERE(
			table.HouseholdMembers.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.HouseholdMembers.UserID.EQ(postgres.UUID(userID))),
		)

	err := stmt.QueryContext(ctx, r.db, &count)
	if err != nil {
		return false, fmt.Errorf("failed to check membership: %w", err)
	}

	return count.Count > 0, nil
}

func (r *HouseholdRepository) Create(
	ctx context.Context,
	household *model.Households,
) (*model.Households, error) {
	var result model.Households

	stmt := table.Households.INSERT(
		table.Households.Name,
		table.Households.Currency,
		table.Households.InviteCode,
		table.Households.OwnerID,
	).MODEL(household).
		RETURNING(table.Households.AllColumns)

	err := stmt.QueryContext(ctx, r.db, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to create household: %w", err)
	}

	return &result, nil
}

func (r *HouseholdRepository) AddMember(ctx context.Context, householdID, userID uuid.UUID) error {
	stmt := table.HouseholdMembers.INSERT(
		table.HouseholdMembers.HouseholdID,
		table.HouseholdMembers.UserID,
	).MODEL(model.HouseholdMembers{
		HouseholdID: householdID,
		UserID:      userID,
	})

	_, err := stmt.ExecContext(ctx, r.db)
	if err != nil {
		return fmt.Errorf("failed to add household member: %w", err)
	}

	return nil
}

func (r *HouseholdRepository) RemoveMember(
	ctx context.Context,
	householdID, userID uuid.UUID,
) error {
	stmt := table.HouseholdMembers.DELETE().
		WHERE(
			table.HouseholdMembers.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.HouseholdMembers.UserID.EQ(postgres.UUID(userID))),
		)

	_, err := stmt.ExecContext(ctx, r.db)
	if err != nil {
		return fmt.Errorf("failed to remove household member: %w", err)
	}

	return nil
}

func (r *HouseholdRepository) UpdateInviteCode(
	ctx context.Context,
	householdID uuid.UUID,
	newCode string,
) (*model.Households, error) {
	var result model.Households

	stmt := table.Households.UPDATE(
		table.Households.InviteCode,
		table.Households.UpdatedAt,
	).SET(
		newCode,
		postgres.Raw("NOW()"),
	).WHERE(
		table.Households.ID.EQ(postgres.UUID(householdID)),
	).RETURNING(table.Households.AllColumns)

	err := stmt.QueryContext(ctx, r.db, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to update invite code: %w", err)
	}

	return &result, nil
}

func (r *HouseholdRepository) Delete(ctx context.Context, id uuid.UUID) error {
	stmt := table.Households.DELETE().
		WHERE(table.Households.ID.EQ(postgres.UUID(id)))

	_, err := stmt.ExecContext(ctx, r.db)
	if err != nil {
		return fmt.Errorf("failed to delete household: %w", err)
	}

	return nil
}
