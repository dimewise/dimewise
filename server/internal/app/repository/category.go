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
	// Exclude deleted items by default (only include if IncludeDeleted is explicitly true)
	if params.IncludeDeleted == nil || !*params.IncludeDeleted {
		cond = cond.AND(tbl.DeletedAt.IS_NULL())
	}

	stmt := tbl.SELECT(tbl.AllColumns).WHERE(cond)

	dest := []model.Category{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to get categories by user id of %s: %w", userID, err)
	}

	return &dest, nil
}

func GetCategoryByID(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	categoryID uuid.UUID,
) (*model.Category, error) {
	tbl := table.Category

	stmt := tbl.SELECT(tbl.AllColumns).
		WHERE(tbl.UserID.EQ(postgres.UUID(userID)).AND(tbl.ID.EQ(postgres.UUID(categoryID))))

	dest := []model.Category{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to get category by id of %s: %w", categoryID, err)
	}

	if len(dest) != 1 {
		return nil, NewError(ErrCodeNotFound, errors.Errorf("expected 1 row, but found none"))
	}

	result := dest[0]

	return &result, nil
}
