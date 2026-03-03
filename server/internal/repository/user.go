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

// UserReader defines read operations for users.
type UserReader interface {
	GetByID(ctx context.Context, id uuid.UUID) (*model.Users, error)
	GetByClerkID(ctx context.Context, clerkID string) (*model.Users, error)
}

// UserWriter defines write operations for users.
type UserWriter interface {
	Upsert(ctx context.Context, user *model.Users) (*model.Users, error)
	UpdateLanguage(ctx context.Context, id uuid.UUID, language string) (*model.Users, error)
}

// UserRepository implements UserReader and UserWriter.
type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Users, error) {
	var user model.Users

	stmt := postgres.SELECT(table.Users.AllColumns).
		FROM(table.Users).
		WHERE(table.Users.ID.EQ(postgres.UUID(id)))

	err := stmt.QueryContext(ctx, r.db, &user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) GetByClerkID(ctx context.Context, clerkID string) (*model.Users, error) {
	var user model.Users

	stmt := postgres.SELECT(table.Users.AllColumns).
		FROM(table.Users).
		WHERE(table.Users.ClerkID.EQ(postgres.String(clerkID)))

	err := stmt.QueryContext(ctx, r.db, &user)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) Upsert(ctx context.Context, user *model.Users) (*model.Users, error) {
	var result model.Users

	stmt := table.Users.INSERT(
		table.Users.ClerkID,
		table.Users.Email,
		table.Users.FirstName,
		table.Users.LastName,
		table.Users.AvatarURL,
		table.Users.LastLoginAt,
	).MODEL(user).
		ON_CONFLICT(table.Users.ClerkID).
		DO_UPDATE(postgres.SET(
			table.Users.Email.SET(table.Users.EXCLUDED.Email),
			table.Users.FirstName.SET(table.Users.EXCLUDED.FirstName),
			table.Users.LastName.SET(table.Users.EXCLUDED.LastName),
			table.Users.AvatarURL.SET(table.Users.EXCLUDED.AvatarURL),
			table.Users.LastLoginAt.SET(table.Users.EXCLUDED.LastLoginAt),
			table.Users.UpdatedAt.SET(postgres.TimestampzExp(postgres.Raw("NOW()"))),
		)).
		RETURNING(table.Users.AllColumns)

	err := stmt.QueryContext(ctx, r.db, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to upsert user: %w", err)
	}

	return &result, nil
}

func (r *UserRepository) UpdateLanguage(
	ctx context.Context,
	id uuid.UUID,
	language string,
) (*model.Users, error) {
	var result model.Users

	stmt := table.Users.UPDATE(
		table.Users.Language,
		table.Users.UpdatedAt,
	).SET(
		language,
		postgres.TimestampzExp(postgres.Raw("NOW()")),
	).WHERE(
		table.Users.ID.EQ(postgres.UUID(id)),
	).RETURNING(table.Users.AllColumns)

	err := stmt.QueryContext(ctx, r.db, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to update user language: %w", err)
	}

	return &result, nil
}
