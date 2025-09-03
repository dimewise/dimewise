package mutation

import (
	"context"

	"github.com/go-errors/errors"
	"github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"

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

func DeleteCategoryByID(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	categoryID uuid.UUID,
) error {
	tbl := table.Category

	stmt := tbl.DELETE().
		WHERE(tbl.UserID.EQ(postgres.UUID(userID)).AND(tbl.ID.EQ(postgres.UUID(categoryID))))

	res, err := stmt.ExecContext(ctx, db)
	if err != nil {
		return errors.Errorf("failed to delete category by id: %w", err)
	}

	affectedCount, err := res.RowsAffected()
	if err != nil {
		return errors.Errorf("failed to get rows affected after delete category: %w", err)
	}

	if affectedCount != 1 {
		return errors.Errorf("expected to delete 1 row, got %d", affectedCount)
	}

	return nil
}
