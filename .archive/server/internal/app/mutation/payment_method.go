package mutation

import (
	"context"
	"time"

	"github.com/go-errors/errors"
	"github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"

	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/generated/dimewise/public/table"
)

func InsertPaymentMethodByModel(
	ctx context.Context,
	db qrm.DB,
	dto model.PaymentMethod,
) (*model.PaymentMethod, error) {
	tbl := table.PaymentMethod

	stmt := tbl.INSERT(tbl.AllColumns).MODEL(dto).RETURNING(tbl.AllColumns)

	dest := model.PaymentMethod{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to insert payment method by model: %w", err)
	}

	return &dest, nil
}

func DeletePaymentMethodByID(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	paymentMethodID uuid.UUID,
) error {
	tbl := table.PaymentMethod

	now := time.Now()
	stmt := tbl.UPDATE(
		tbl.DeletedAt,
		tbl.UpdatedAt,
	).SET(
		tbl.DeletedAt.SET(postgres.TimestampzT(now)),
		tbl.UpdatedAt.SET(postgres.TimestampzT(now)),
	).WHERE(
		tbl.UserID.EQ(postgres.UUID(userID)).AND(tbl.ID.EQ(postgres.UUID(paymentMethodID))),
	)

	res, err := stmt.ExecContext(ctx, db)
	if err != nil {
		return errors.Errorf("failed to delete payment method by id: %w", err)
	}

	affectedCount, err := res.RowsAffected()
	if err != nil {
		return errors.Errorf("failed to get rows affected after delete payment method: %w", err)
	}

	if affectedCount != 1 {
		return errors.Errorf("expected to delete 1 row, got %d", affectedCount)
	}

	return nil
}

func UpdatePaymentMethodByModel(
	ctx context.Context,
	db qrm.DB,
	updatedPaymentMethod model.PaymentMethod,
) (*model.PaymentMethod, error) {
	tbl := table.PaymentMethod

	stmt := tbl.UPDATE(tbl.MutableColumns).
		MODEL(updatedPaymentMethod).
		WHERE(tbl.ID.EQ(postgres.UUID(updatedPaymentMethod.ID))).
		RETURNING(tbl.AllColumns)

	dest := []model.PaymentMethod{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf(
			"failed to update payment method with id '%s': %w",
			updatedPaymentMethod.ID,
			err,
		)
	}

	if len(dest) != 1 {
		return nil, errors.Errorf("expected to affect 1 row, but got %d", len(dest))
	}

	return &dest[0], nil
}
