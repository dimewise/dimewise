package repository

import (
	"time"

	. "github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"
	"github.com/teoyi/dimewise/db/dimewise/public/model"
	"github.com/teoyi/dimewise/db/dimewise/public/table"
	"github.com/teoyi/dimewise/internal/dto"
	lerrors "github.com/teoyi/dimewise/internal/util/errors"
)

type IExpenseRepository interface {
	CreateExpenseByModel(expense *model.Expense) (*model.Expense, error)
	GetExpenseByID(expenseID uuid.UUID) (*model.Expense, error)
	GetExpenseByAccountID(accountID uuid.UUID) (*[]model.Expense, error)
	GetMonthlyOverview(accountID uuid.UUID) (*[]dto.MonthlyOverviewDto, error)
	UpdateExpenseByModel(expense *model.Expense) (*model.Expense, error)
	DeleteExpenseByID(expenseID uuid.UUID) (*model.Expense, error)
}

type expenseRepository struct {
	db *qrm.DB
}

func NewExpenseRepository(db qrm.DB) IExpenseRepository {
	return &expenseRepository{
		db: &db,
	}
}

func (r *expenseRepository) CreateExpenseByModel(expense *model.Expense) (*model.Expense, error) {
	tbl := table.Expense
	stmt := tbl.INSERT(tbl.MutableColumns).MODEL(expense).RETURNING(tbl.AllColumns)

	dest := []model.Expense{}
	err := stmt.Query(*r.db, &dest)
	if err != nil {
		return nil, err
	}

	if len(dest) != 1 {
		return nil, lerrors.ErrResourceNotFound
	}

	insertedExpense := dest[0]
	return &insertedExpense, nil
}

func (r *expenseRepository) GetExpenseByID(expenseID uuid.UUID) (*model.Expense, error) {
	tbl := table.Expense
	stmt := SELECT(tbl.AllColumns).FROM(tbl).WHERE(tbl.ID.EQ(UUID(expenseID))).LIMIT(1)

	rows := []model.Expense{}
	err := stmt.Query(*r.db, &rows)
	if err != nil {
		return nil, err
	}

	if len(rows) != 1 {
		return nil, lerrors.ErrResourceNotFound
	}

	row := rows[0]
	return &row, nil
}

func (r *expenseRepository) GetExpenseByAccountID(accountID uuid.UUID) (*[]model.Expense, error) {
	tbl := table.Expense
	stmt := SELECT(tbl.AllColumns).FROM(tbl).WHERE(tbl.AccountID.EQ(UUID(accountID)))

	rows := []model.Expense{}
	err := stmt.Query(*r.db, &rows)
	if err != nil {
		return nil, err
	}

	return &rows, nil
}

func (r *expenseRepository) UpdateExpenseByModel(expense *model.Expense) (*model.Expense, error) {
	tbl := table.Expense
	stmt := tbl.UPDATE(tbl.MutableColumns).MODEL(expense).WHERE(tbl.ID.EQ(UUID(expense.ID))).RETURNING(tbl.AllColumns)

	rows := []model.Expense{}
	err := stmt.Query(*r.db, &rows)
	if err != nil {
		return nil, err
	}

	if len(rows) != 1 {
		return nil, lerrors.ErrResourceNotFound
	}

	row := rows[0]
	return &row, nil
}

func (r *expenseRepository) DeleteExpenseByID(expenseID uuid.UUID) (*model.Expense, error) {
	tbl := table.Expense
	stmt := tbl.DELETE().WHERE(tbl.ID.EQ(UUID(expenseID))).RETURNING(tbl.AllColumns)

	rows := []model.Expense{}
	err := stmt.Query(*r.db, &rows)
	if err != nil {
		return nil, err
	}

	if len(rows) != 1 {
		return nil, lerrors.ErrResourceNotFound
	}

	row := rows[0]
	return &row, nil
}

func (r *expenseRepository) GetMonthlyOverview(accountID uuid.UUID) (*[]dto.MonthlyOverviewDto, error) {
	stmt := RawStatement(
		`
      SELECT
        EXTRACT(MONTH FROM "created_at") AS month,
        SUM("amount") AS amount
      FROM
        "expense"
      WHERE
        EXTRACT(YEAR FROM "created_at") = $1
        AND "account_id" = $2
      GROUP BY
        EXTRACT(MONTH FROM "created_at")
      ORDER BY
        EXTRACT(MONTH FROM "created_at")
    `,
		RawArgs{
			"$1": time.Now().Year(),
			"$2": accountID,
		},
	)

	rows := []dto.MonthlyOverviewDto{}
	err := stmt.Query(*r.db, &rows)
	if err != nil {
		return nil, err
	}

	return &rows, nil
}
