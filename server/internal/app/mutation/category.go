package mutation

import (
	"context"

	"github.com/go-errors/errors"
	"github.com/go-jet/jet/v2/qrm"

	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/generated/dimewise/public/table"
)

func InsertCategoryByModel(
	ctx context.Context,
	db qrm.DB,
	dto model.Category,
) (*model.Category, error) {
	tbl := table.Category

	stmt := tbl.INSERT(tbl.AllColumns).MODEL(dto).RETURNING(tbl.AllColumns)

	dest := model.Category{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to insert category by model: %w", err)
	}

	return &dest, nil
}
