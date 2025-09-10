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

func GetPaymentMethodsByUserID(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	params oapi.GetPaymentMethodsParams,
) (*[]model.PaymentMethod, error) {
	tbl := table.PaymentMethod

	cond := tbl.UserID.EQ(postgres.UUID(userID))
	if params.IncludeDeleted != nil && !*params.IncludeDeleted {
		cond = cond.AND(tbl.DeletedAt.IS_NULL())
	}

	stmt := tbl.SELECT(tbl.AllColumns).WHERE(cond)

	dest := []model.PaymentMethod{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to get payment methods by user id: %w", err)
	}

	return &dest, nil
}

func GetPaymentMethodByID(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	paymentMethodID uuid.UUID,
) (*model.PaymentMethod, error) {
	tbl := table.PaymentMethod

	stmt := tbl.SELECT(tbl.AllColumns).
		WHERE(tbl.UserID.EQ(postgres.UUID(userID)).AND(tbl.ID.EQ(postgres.UUID(paymentMethodID))))

	dest := []model.PaymentMethod{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to get payment method by id: %w", err)
	}

	if len(dest) != 1 {
		return nil, NewError(ErrCodeNotFound, errors.Errorf("expected 1 row, but found none"))
	}

	result := dest[0]

	return &result, nil
}
