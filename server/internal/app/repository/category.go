package repository

import (
	"context"

	"github.com/go-errors/errors"
	"github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"

	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/generated/dimewise/public/table"
	"github.com/dimewise/dimewise/generated/oapi"
)

func GetCategoriesByUserID(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	params oapi.GetCategoriesParams,
) (*[]model.Category, error) {
	tbl := table.Category

	cond := tbl.UserID.EQ(postgres.UUID(userID))
	if params.IncludeDeleted != nil && !*params.IncludeDeleted {
		cond = cond.AND(tbl.DeletedAt.IS_NOT_NULL())
	}

	stmt := tbl.SELECT(tbl.AllColumns).WHERE(cond)

	dest := []model.Category{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to get categories by user id of %s: %w", userID, err)
	}

	return &dest, nil
}
