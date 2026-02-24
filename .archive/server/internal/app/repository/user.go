package repository

import (
	"context"

	"github.com/go-errors/errors"
	"github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"

	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/generated/dimewise/public/table"
)

func GetUserByClerkID(ctx context.Context, db qrm.DB, clerkID string) (*model.User, error) {
	tbl := table.User

	stmt := tbl.SELECT(tbl.AllColumns).WHERE(tbl.ClerkID.EQ(postgres.String(clerkID)))

	dest := []model.User{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to get user by clerk id of %s: %w", clerkID, err)
	}

	if len(dest) != 1 {
		return nil, errors.Errorf("expected at least one result, but got %d", len(dest))
	}

	result := dest[0]

	return &result, nil
}
