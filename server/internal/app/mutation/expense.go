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

func InsertExpenseByModel(
	ctx context.Context,
	db qrm.DB,
	dto model.Expense,
) (*model.Expense, error) {
	tbl := table.Expense

	stmt := tbl.INSERT(tbl.AllColumns).MODEL(dto).RETURNING(tbl.AllColumns)

	dest := model.Expense{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to insert expense by model: %w", err)
	}

	return &dest, nil
}

func DeleteExpenseByID(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	expenseID uuid.UUID,
) error {
	tbl := table.Expense

	stmt := tbl.DELETE().
		WHERE(tbl.UserID.EQ(postgres.UUID(userID)).AND(tbl.ID.EQ(postgres.UUID(expenseID))))

	res, err := stmt.ExecContext(ctx, db)
	if err != nil {
		return errors.Errorf("failed to delete expense by id: %w", err)
	}

	affectedCount, err := res.RowsAffected()
	if err != nil {
		return errors.Errorf("failed to get rows affected after delete expense: %w", err)
	}

	if affectedCount != 1 {
		return errors.Errorf("expected to delete 1 row, got %d", affectedCount)
	}

	return nil
}

func UpdateExpenseByModel(
	ctx context.Context,
	db qrm.DB,
	updatedExpense model.Expense,
) (*model.Expense, error) {
	tbl := table.Expense

	stmt := tbl.UPDATE(tbl.MutableColumns).
		MODEL(updatedExpense).
		WHERE(tbl.ID.EQ(postgres.UUID(updatedExpense.ID))).
		RETURNING(tbl.AllColumns)

	dest := []model.Expense{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf(
			"failed to update expense with id '%s': %w",
			updatedExpense.ID,
			err,
		)
	}

	if len(dest) != 1 {
		return nil, errors.Errorf("expected to affect 1 row, but got %d", len(dest))
	}

	return &dest[0], nil
}
