package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/go-jet/jet/v2/postgres"
	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/model"
	"dimewise/generated/dimewise/public/table"
)

// ExpenseWithSplits is a joined result of expense + its splits.
type ExpenseWithSplits struct {
	model.Expenses

	Splits []model.ExpenseSplits
}

// ExpenseFilter holds optional filter criteria for listing expenses.
type ExpenseFilter struct {
	CategoryID *uuid.UUID
	PaidBy     *uuid.UUID
	From       *time.Time
	To         *time.Time
	Limit      int
	Offset     int
}

// PairwiseSplit holds the total split amount for a (payer, beneficiary) pair.
type PairwiseSplit struct {
	PaidBy uuid.UUID `sql:"primary_key" alias:"expenses.paid_by"`
	UserID uuid.UUID `                  alias:"expense_splits.user_id"`
	Total  int64     `                  alias:"pairwise.total"`
}

// ExpenseReader defines read operations for expenses.
type ExpenseReader interface {
	List(
		ctx context.Context,
		householdID uuid.UUID,
		filter ExpenseFilter,
	) ([]ExpenseWithSplits, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*ExpenseWithSplits, error)
	GetSpendingByCategory(
		ctx context.Context,
		householdID uuid.UUID,
		from time.Time,
		to time.Time,
	) ([]BudgetCategorySpending, error)
	GetUserSpending(
		ctx context.Context,
		householdID uuid.UUID,
		from time.Time,
		to time.Time,
	) (map[uuid.UUID]int64, error)
	GetUserSplits(
		ctx context.Context,
		householdID uuid.UUID,
		from time.Time,
		to time.Time,
	) (map[uuid.UUID]int64, error)
	GetPairwiseSplits(
		ctx context.Context,
		householdID uuid.UUID,
		from time.Time,
		to time.Time,
	) ([]PairwiseSplit, error)
}

// ExpenseWriter defines write operations for expenses.
type ExpenseWriter interface {
	Create(
		ctx context.Context,
		expense *model.Expenses,
		splits []model.ExpenseSplits,
	) (*ExpenseWithSplits, error)
	Update(
		ctx context.Context,
		expense *model.Expenses,
		splits []model.ExpenseSplits,
	) (*ExpenseWithSplits, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

// ExpenseRepository implements ExpenseReader and ExpenseWriter.
type ExpenseRepository struct {
	db *sql.DB
}

func NewExpenseRepository(db *sql.DB) *ExpenseRepository {
	return &ExpenseRepository{db: db}
}

//nolint:funlen // sequential query-and-assemble pattern that is clearer as a single function
func (r *ExpenseRepository) List(
	ctx context.Context,
	householdID uuid.UUID,
	filter ExpenseFilter,
) ([]ExpenseWithSplits, int, error) {
	// Build WHERE conditions
	conditions := []postgres.BoolExpression{
		table.Expenses.HouseholdID.EQ(postgres.UUID(householdID)),
	}

	if filter.CategoryID != nil {
		conditions = append(conditions,
			table.Expenses.BudgetCategoryID.EQ(postgres.UUID(*filter.CategoryID)),
		)
	}

	if filter.PaidBy != nil {
		conditions = append(conditions,
			table.Expenses.PaidBy.EQ(postgres.UUID(*filter.PaidBy)),
		)
	}

	if filter.From != nil {
		conditions = append(conditions,
			table.Expenses.IncurredAt.GT_EQ(postgres.TimestampzT(*filter.From)),
		)
	}

	if filter.To != nil {
		conditions = append(conditions,
			table.Expenses.IncurredAt.LT_EQ(postgres.TimestampzT(*filter.To)),
		)
	}

	where := conditions[0]
	for _, c := range conditions[1:] {
		where = where.AND(c)
	}

	// Count total
	var countResult struct {
		Count int64
	}

	countStmt := postgres.SELECT(postgres.COUNT(table.Expenses.ID).AS("count")).
		FROM(table.Expenses).
		WHERE(where)

	err := countStmt.QueryContext(ctx, r.db, &countResult)
	if err != nil {
		return nil, 0, err
	}

	// Fetch expenses with pagination
	limit := filter.Limit
	if limit <= 0 {
		limit = 50
	}

	var expenses []model.Expenses

	stmt := postgres.SELECT(table.Expenses.AllColumns).
		FROM(table.Expenses).
		WHERE(where).
		ORDER_BY(table.Expenses.IncurredAt.DESC(), table.Expenses.CreatedAt.DESC()).
		LIMIT(int64(limit)).
		OFFSET(int64(filter.Offset))

	err = stmt.QueryContext(ctx, r.db, &expenses)
	if err != nil {
		return nil, 0, err
	}

	if len(expenses) == 0 {
		return []ExpenseWithSplits{}, int(countResult.Count), nil
	}

	// Fetch all splits for the returned expenses
	expenseIDs := make([]postgres.Expression, len(expenses))
	expenseMap := make(map[uuid.UUID]*ExpenseWithSplits, len(expenses))
	result := make([]ExpenseWithSplits, len(expenses))

	for i, exp := range expenses {
		expenseIDs[i] = postgres.UUID(exp.ID)
		result[i] = ExpenseWithSplits{
			Expenses: exp,
			Splits:   []model.ExpenseSplits{},
		}
		expenseMap[exp.ID] = &result[i]
	}

	var splits []model.ExpenseSplits

	splitStmt := postgres.SELECT(table.ExpenseSplits.AllColumns).
		FROM(table.ExpenseSplits).
		WHERE(table.ExpenseSplits.ExpenseID.IN(expenseIDs...))

	err = splitStmt.QueryContext(ctx, r.db, &splits)
	if err != nil {
		return nil, 0, err
	}

	for _, split := range splits {
		if ews, ok := expenseMap[split.ExpenseID]; ok {
			ews.Splits = append(ews.Splits, split)
		}
	}

	return result, int(countResult.Count), nil
}

func (r *ExpenseRepository) GetByID(
	ctx context.Context,
	id uuid.UUID,
) (*ExpenseWithSplits, error) {
	var expense model.Expenses

	stmt := postgres.SELECT(table.Expenses.AllColumns).
		FROM(table.Expenses).
		WHERE(table.Expenses.ID.EQ(postgres.UUID(id)))

	err := stmt.QueryContext(ctx, r.db, &expense)
	if err != nil {
		return nil, err
	}

	var splits []model.ExpenseSplits

	splitStmt := postgres.SELECT(table.ExpenseSplits.AllColumns).
		FROM(table.ExpenseSplits).
		WHERE(table.ExpenseSplits.ExpenseID.EQ(postgres.UUID(id)))

	err = splitStmt.QueryContext(ctx, r.db, &splits)
	if err != nil {
		return nil, err
	}

	if splits == nil {
		splits = []model.ExpenseSplits{}
	}

	return &ExpenseWithSplits{
		Expenses: expense,
		Splits:   splits,
	}, nil
}

func (r *ExpenseRepository) GetSpendingByCategory(
	ctx context.Context,
	householdID uuid.UUID,
	from time.Time,
	to time.Time,
) ([]BudgetCategorySpending, error) {
	var results []BudgetCategorySpending

	stmt := postgres.SELECT(
		table.Expenses.BudgetCategoryID,
		postgres.SUMi(table.Expenses.Amount).AS("expenses.spent"),
	).
		FROM(table.Expenses).
		WHERE(
			table.Expenses.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.Expenses.BudgetCategoryID.IS_NOT_NULL()).
				AND(table.Expenses.IncurredAt.GT_EQ(postgres.TimestampzT(from))).
				AND(table.Expenses.IncurredAt.LT(postgres.TimestampzT(to))),
		).
		GROUP_BY(table.Expenses.BudgetCategoryID)

	err := stmt.QueryContext(ctx, r.db, &results)
	if err != nil {
		return nil, err
	}

	return results, nil
}

func (r *ExpenseRepository) GetUserSpending(
	ctx context.Context,
	householdID uuid.UUID,
	from time.Time,
	to time.Time,
) (map[uuid.UUID]int64, error) {
	var results []struct {
		PaidBy uuid.UUID `sql:"primary_key" alias:"expenses.paid_by"`
		Total  int64     `alias:"expenses.total"`
	}

	stmt := postgres.SELECT(
		table.Expenses.PaidBy,
		postgres.SUMi(table.Expenses.Amount).AS("expenses.total"),
	).
		FROM(table.Expenses).
		WHERE(
			table.Expenses.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.Expenses.IncurredAt.GT_EQ(postgres.TimestampzT(from))).
				AND(table.Expenses.IncurredAt.LT(postgres.TimestampzT(to))),
		).
		GROUP_BY(table.Expenses.PaidBy)

	err := stmt.QueryContext(ctx, r.db, &results)
	if err != nil {
		return nil, err
	}

	m := make(map[uuid.UUID]int64, len(results))
	for _, r := range results {
		m[r.PaidBy] = r.Total
	}

	return m, nil
}

func (r *ExpenseRepository) GetUserSplits(
	ctx context.Context,
	householdID uuid.UUID,
	from time.Time,
	to time.Time,
) (map[uuid.UUID]int64, error) {
	var results []struct {
		UserID uuid.UUID `sql:"primary_key" alias:"expense_splits.user_id"`
		Total  int64     `alias:"expense_splits.total"`
	}

	stmt := postgres.SELECT(
		table.ExpenseSplits.UserID,
		postgres.SUMi(table.ExpenseSplits.Amount).AS("expense_splits.total"),
	).
		FROM(
			table.ExpenseSplits.
				INNER_JOIN(table.Expenses, table.Expenses.ID.EQ(table.ExpenseSplits.ExpenseID)),
		).
		WHERE(
			table.Expenses.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.Expenses.IncurredAt.GT_EQ(postgres.TimestampzT(from))).
				AND(table.Expenses.IncurredAt.LT(postgres.TimestampzT(to))),
		).
		GROUP_BY(table.ExpenseSplits.UserID)

	err := stmt.QueryContext(ctx, r.db, &results)
	if err != nil {
		return nil, err
	}

	m := make(map[uuid.UUID]int64, len(results))
	for _, r := range results {
		m[r.UserID] = r.Total
	}

	return m, nil
}

func (r *ExpenseRepository) GetPairwiseSplits(
	ctx context.Context,
	householdID uuid.UUID,
	from time.Time,
	to time.Time,
) ([]PairwiseSplit, error) {
	var results []PairwiseSplit

	stmt := postgres.SELECT(
		table.Expenses.PaidBy,
		table.ExpenseSplits.UserID,
		postgres.SUMi(table.ExpenseSplits.Amount).AS("pairwise.total"),
	).
		FROM(
			table.ExpenseSplits.
				INNER_JOIN(table.Expenses, table.Expenses.ID.EQ(table.ExpenseSplits.ExpenseID)),
		).
		WHERE(
			table.Expenses.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.Expenses.IncurredAt.GT_EQ(postgres.TimestampzT(from))).
				AND(table.Expenses.IncurredAt.LT(postgres.TimestampzT(to))).
				AND(table.Expenses.PaidBy.NOT_EQ(table.ExpenseSplits.UserID)),
		).
		GROUP_BY(table.Expenses.PaidBy, table.ExpenseSplits.UserID)

	err := stmt.QueryContext(ctx, r.db, &results)
	if err != nil {
		return nil, err
	}

	return results, nil
}

func (r *ExpenseRepository) Create(
	ctx context.Context,
	expense *model.Expenses,
	splits []model.ExpenseSplits,
) (*ExpenseWithSplits, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	defer func() { _ = tx.Rollback() }()

	// Insert expense
	var created model.Expenses

	insertExp := table.Expenses.
		INSERT(
			table.Expenses.HouseholdID,
			table.Expenses.BudgetCategoryID,
			table.Expenses.PaidBy,
			table.Expenses.LoggedBy,
			table.Expenses.Title,
			table.Expenses.Amount,
			table.Expenses.Notes,
			table.Expenses.IncurredAt,
		).
		VALUES(
			expense.HouseholdID,
			expense.BudgetCategoryID,
			expense.PaidBy,
			expense.LoggedBy,
			expense.Title,
			expense.Amount,
			expense.Notes,
			expense.IncurredAt,
		).
		RETURNING(table.Expenses.AllColumns)

	err = insertExp.QueryContext(ctx, tx, &created)
	if err != nil {
		return nil, err
	}

	// Insert splits
	createdSplits := make([]model.ExpenseSplits, 0, len(splits))

	for _, split := range splits {
		var cs model.ExpenseSplits

		insertSplit := table.ExpenseSplits.
			INSERT(
				table.ExpenseSplits.ExpenseID,
				table.ExpenseSplits.UserID,
				table.ExpenseSplits.Amount,
			).
			VALUES(created.ID, split.UserID, split.Amount).
			RETURNING(table.ExpenseSplits.AllColumns)

		err = insertSplit.QueryContext(ctx, tx, &cs)
		if err != nil {
			return nil, err
		}

		createdSplits = append(createdSplits, cs)
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return &ExpenseWithSplits{
		Expenses: created,
		Splits:   createdSplits,
	}, nil
}

func (r *ExpenseRepository) Update(
	ctx context.Context,
	expense *model.Expenses,
	splits []model.ExpenseSplits,
) (*ExpenseWithSplits, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	defer func() { _ = tx.Rollback() }()

	// Update expense
	var updated model.Expenses

	updateExp := table.Expenses.
		UPDATE(
			table.Expenses.BudgetCategoryID,
			table.Expenses.PaidBy,
			table.Expenses.Title,
			table.Expenses.Amount,
			table.Expenses.Notes,
			table.Expenses.IncurredAt,
			table.Expenses.UpdatedAt,
		).
		SET(
			expense.BudgetCategoryID,
			expense.PaidBy,
			expense.Title,
			expense.Amount,
			expense.Notes,
			expense.IncurredAt,
			postgres.NOW(),
		).
		WHERE(table.Expenses.ID.EQ(postgres.UUID(expense.ID))).
		RETURNING(table.Expenses.AllColumns)

	err = updateExp.QueryContext(ctx, tx, &updated)
	if err != nil {
		return nil, err
	}

	// Delete existing splits and re-insert
	deleteStmt := table.ExpenseSplits.
		DELETE().
		WHERE(table.ExpenseSplits.ExpenseID.EQ(postgres.UUID(expense.ID)))

	_, err = deleteStmt.ExecContext(ctx, tx)
	if err != nil {
		return nil, err
	}

	createdSplits := make([]model.ExpenseSplits, 0, len(splits))

	for _, split := range splits {
		var cs model.ExpenseSplits

		insertSplit := table.ExpenseSplits.
			INSERT(
				table.ExpenseSplits.ExpenseID,
				table.ExpenseSplits.UserID,
				table.ExpenseSplits.Amount,
			).
			VALUES(updated.ID, split.UserID, split.Amount).
			RETURNING(table.ExpenseSplits.AllColumns)

		err = insertSplit.QueryContext(ctx, tx, &cs)
		if err != nil {
			return nil, err
		}

		createdSplits = append(createdSplits, cs)
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return &ExpenseWithSplits{
		Expenses: updated,
		Splits:   createdSplits,
	}, nil
}

func (r *ExpenseRepository) Delete(ctx context.Context, id uuid.UUID) error {
	stmt := table.Expenses.
		DELETE().
		WHERE(table.Expenses.ID.EQ(postgres.UUID(id)))

	_, err := stmt.ExecContext(ctx, r.db)

	return err
}
