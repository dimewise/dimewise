package mutation

import (
	"context"
	"time"

	"github.com/go-errors/errors"
	"github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"

	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/generated/dimewise/public/table"
	"github.com/dimewise/dimewise/generated/oapi"
)

func InsertUserByModel(
	ctx context.Context,
	db qrm.DB,
	dto model.User,
) (*model.User, error) {
	tbl := table.User

	stmt := tbl.INSERT(tbl.AllColumns).MODEL(dto).RETURNING(tbl.AllColumns)

	dest := model.User{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to insert user by model: %w", err)
	}

	return &dest, nil
}

func UpdateUserByClerkID(
	ctx context.Context,
	db qrm.DB,
	clerkID string,
	form oapi.UserUpdate,
) (*model.User, error) {
	tbl := table.User

	now := time.Now()
	stmt := tbl.UPDATE(
		tbl.Currency,
		tbl.PreferredLanguage,
		tbl.UpdatedAt,
	).SET(
		tbl.Currency.SET(postgres.String(string(form.Currency))),
		tbl.PreferredLanguage.SET(postgres.String(string(form.PreferredLanguage))),
		tbl.UpdatedAt.SET(postgres.TimestampzT(now)),
	).WHERE(
		tbl.ClerkID.EQ(postgres.String(clerkID)),
	).RETURNING(tbl.AllColumns)

	dest := model.User{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to update user by clerk id: %w", err)
	}

	return &dest, nil
}
