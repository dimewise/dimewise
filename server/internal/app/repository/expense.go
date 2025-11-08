package repository

import (
	"context"
	"time"

	"github.com/go-errors/errors"
	"github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"

	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/generated/dimewise/public/table"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/app/dto"
)

func GetFullExpensesByUserID(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	params oapi.GetExpensesParams,
) (*[]dto.ExpenseFull, *dto.CursorPagination, error) {
	// Aliases for joined tables
	expenseTbl := table.Expense
	categoryTbl := table.Category
	paymentTbl := table.PaymentMethod

	// Build dynamic filter
	cond := expenseTbl.UserID.EQ(postgres.UUID(userID))
	if params.CategoryId != nil {
		cond = cond.AND(expenseTbl.CategoryID.EQ(postgres.UUID(*params.CategoryId)))
	}
	if params.PaymentMethodId != nil {
		cond = cond.AND(expenseTbl.PaymentMethodID.EQ(postgres.UUID(*params.PaymentMethodId)))
	}
	if params.Search != nil && *params.Search != "" {
		searchTerm := "%" + *params.Search + "%"
		cond = cond.AND(
			expenseTbl.Title.LIKE(postgres.String(searchTerm)).OR(
				expenseTbl.Description.LIKE(postgres.String(searchTerm)),
			),
		)
	}
	if params.DateFrom != nil {
		dateFrom := *params.DateFrom
		cond = cond.AND(expenseTbl.IncurredAt.GT_EQ(postgres.TimestampzT(dateFrom.Time)))
	}
	if params.DateTo != nil {
		dateTo := *params.DateTo
		cond = cond.AND(expenseTbl.IncurredAt.LT_EQ(postgres.TimestampzT(dateTo.Time)))
	}
	if params.VerificationStatus != nil {
		if *params.VerificationStatus == "verified" {
			cond = cond.AND(expenseTbl.VerifiedAt.IS_NOT_NULL())
		} else if *params.VerificationStatus == "unverified" {
			cond = cond.AND(expenseTbl.VerifiedAt.IS_NULL())
		}
	}

	limit := 20
	if params.Limit != nil {
		limit = *params.Limit
	}

	// Handle cursor-based pagination
	if params.Cursor != nil && *params.Cursor != "" {
		cursorData, err := dto.DecodeCursor(*params.Cursor)
		if err != nil {
			return nil, nil, errors.Errorf("invalid cursor format: %w", err)
		}
		cursorStmt := expenseTbl.SELECT(expenseTbl.IncurredAt, expenseTbl.ID).
			WHERE(expenseTbl.ID.EQ(postgres.UUID(cursorData.ID)).AND(expenseTbl.UserID.EQ(postgres.UUID(userID))))
		var cursorExpense struct {
			IncurredAt time.Time
			ID         uuid.UUID
		}
		err = cursorStmt.QueryContext(ctx, db, &cursorExpense)
		if err != nil {
			return nil, nil, errors.Errorf("cursor not found or access denied: %w", err)
		}
		cond = cond.AND(
			(expenseTbl.IncurredAt.LT(postgres.TimestampzT(cursorData.Timestamp))).OR(
				expenseTbl.IncurredAt.EQ(postgres.TimestampzT(cursorData.Timestamp)).AND(
					expenseTbl.ID.LT(postgres.UUID(cursorData.ID)),
				),
			),
		)
	}

	// Compose JOIN statement and select columns for nested struct scan
	stmt := expenseTbl.
		INNER_JOIN(categoryTbl, expenseTbl.CategoryID.EQ(categoryTbl.ID)).
		INNER_JOIN(paymentTbl, expenseTbl.PaymentMethodID.EQ(paymentTbl.ID)).
		SELECT(
			expenseTbl.AllColumns,
			categoryTbl.AllColumns,
			paymentTbl.AllColumns,
		).
		WHERE(cond).
		ORDER_BY(expenseTbl.IncurredAt.DESC(), expenseTbl.ID.DESC()).
		LIMIT(int64(limit + 1))

	// Struct to receive joined results (Jet will scan AllColumns by struct name match)
	dest := []dto.ExpenseFull{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, nil, errors.Errorf("failed to get expenses by user id: %w", err)
	}

	hasNext := len(dest) > limit
	hasPrev := params.Cursor != nil && *params.Cursor != ""

	if hasNext {
		dest = dest[:limit]
	}

	var nextCursor, prevCursor *string
	if hasNext && len(dest) > 0 {
		lastExpense := dest[len(dest)-1].Expense
		encoded, err := dto.CreateCursorFromExpense(lastExpense.ID, lastExpense.IncurredAt)
		if err == nil {
			nextCursor = &encoded
		}
	}
	if hasPrev && len(dest) > 0 {
		firstExpense := dest[0].Expense
		encoded, err := dto.CreateCursorFromExpense(firstExpense.ID, firstExpense.IncurredAt)
		if err == nil {
			prevCursor = &encoded
		}
	}

	pagination := &dto.CursorPagination{
		Limit:      limit,
		HasNext:    hasNext,
		HasPrev:    hasPrev,
		NextCursor: nextCursor,
		PrevCursor: prevCursor,
	}
	return &dest, pagination, nil
}

func GetExpenseByID(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	expenseID uuid.UUID,
) (*model.Expense, error) {
	tbl := table.Expense

	stmt := tbl.SELECT(tbl.AllColumns).
		WHERE(tbl.UserID.EQ(postgres.UUID(userID)).AND(tbl.ID.EQ(postgres.UUID(expenseID))))

	dest := []model.Expense{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to get expense by id: %w", err)
	}

	if len(dest) != 1 {
		return nil, NewError(ErrCodeNotFound, errors.Errorf("expected 1 row, but found none"))
	}

	result := dest[0]

	return &result, nil
}

func GetExpenseFullByID(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	expenseID uuid.UUID,
) (*dto.ExpenseFull, error) {
	// Aliases for joined tables
	expenseTbl := table.Expense
	categoryTbl := table.Category
	paymentTbl := table.PaymentMethod

	// Compose JOIN statement and select columns for nested struct scan
	stmt := expenseTbl.
		INNER_JOIN(categoryTbl, expenseTbl.CategoryID.EQ(categoryTbl.ID)).
		INNER_JOIN(paymentTbl, expenseTbl.PaymentMethodID.EQ(paymentTbl.ID)).
		SELECT(
			expenseTbl.AllColumns,
			categoryTbl.AllColumns,
			paymentTbl.AllColumns,
		).
		WHERE(expenseTbl.UserID.EQ(postgres.UUID(userID)).AND(expenseTbl.ID.EQ(postgres.UUID(expenseID))))

	// Struct to receive joined results (Jet will scan AllColumns by struct name match)
	dest := []dto.ExpenseFull{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to get expense full by id: %w", err)
	}

	if len(dest) != 1 {
		return nil, NewError(ErrCodeNotFound, errors.Errorf("expected 1 row, but found none"))
	}

	result := dest[0]
	return &result, nil
}

func GetRecentTransactions(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	limit int,
	startDate *time.Time,
	endDate *time.Time,
) (*[]dto.ExpenseFull, error) {
	// Aliases for joined tables
	expenseTbl := table.Expense
	categoryTbl := table.Category
	paymentTbl := table.PaymentMethod

	cond := expenseTbl.UserID.EQ(postgres.UUID(userID))

	// Filter by date range if provided
	if startDate != nil && endDate != nil {
		cond = cond.AND(
			expenseTbl.IncurredAt.GT_EQ(postgres.TimestampzT(*startDate)).AND(
				expenseTbl.IncurredAt.LT(postgres.TimestampzT(*endDate)),
			),
		)
	}

	// Compose JOIN statement and select columns for nested struct scan
	stmt := expenseTbl.
		INNER_JOIN(categoryTbl, expenseTbl.CategoryID.EQ(categoryTbl.ID)).
		INNER_JOIN(paymentTbl, expenseTbl.PaymentMethodID.EQ(paymentTbl.ID)).
		SELECT(
			expenseTbl.AllColumns,
			categoryTbl.AllColumns,
			paymentTbl.AllColumns,
		).
		WHERE(cond).
		ORDER_BY(expenseTbl.IncurredAt.DESC()).
		LIMIT(int64(limit))

	// Struct to receive joined results (Jet will scan AllColumns by struct name match)
	dest := []dto.ExpenseFull{}
	err := stmt.QueryContext(ctx, db, &dest)
	if err != nil {
		return nil, errors.Errorf("failed to get recent transactions: %w", err)
	}

	return &dest, nil
}
