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

// BudgetCategorySpending holds a category's spent amount for a period.
type BudgetCategorySpending struct {
	BudgetCategoryID uuid.UUID `alias:"expenses.budget_category_id"`
	Spent            int64     `alias:"expenses.spent"`
}

// BudgetReader defines read operations for budget categories.
type BudgetReader interface {
	ListByHousehold(ctx context.Context, householdID uuid.UUID) ([]model.BudgetCategories, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.BudgetCategories, error)
	GetSpendingByCategory(
		ctx context.Context,
		householdID uuid.UUID,
		from time.Time,
		to time.Time,
	) ([]BudgetCategorySpending, error)
}

// BudgetWriter defines write operations for budget categories.
type BudgetWriter interface {
	Create(ctx context.Context, category *model.BudgetCategories) (*model.BudgetCategories, error)
	Update(ctx context.Context, category *model.BudgetCategories) (*model.BudgetCategories, error)
	SoftDelete(ctx context.Context, id uuid.UUID) error
	RecordHistory(
		ctx context.Context,
		categoryID uuid.UUID,
		amount int64,
		changedBy uuid.UUID,
	) error
}

// BudgetRepository implements BudgetReader and BudgetWriter.
type BudgetRepository struct {
	db *sql.DB
}

func NewBudgetRepository(db *sql.DB) *BudgetRepository {
	return &BudgetRepository{db: db}
}

func (r *BudgetRepository) ListByHousehold(
	ctx context.Context,
	householdID uuid.UUID,
) ([]model.BudgetCategories, error) {
	var categories []model.BudgetCategories

	stmt := postgres.SELECT(table.BudgetCategories.AllColumns).
		FROM(table.BudgetCategories).
		WHERE(
			table.BudgetCategories.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.BudgetCategories.DeletedAt.IS_NULL()),
		).
		ORDER_BY(table.BudgetCategories.SortOrder.ASC(), table.BudgetCategories.CreatedAt.ASC())

	err := stmt.QueryContext(ctx, r.db, &categories)
	if err != nil {
		return nil, err
	}

	return categories, nil
}

func (r *BudgetRepository) GetByID(
	ctx context.Context,
	id uuid.UUID,
) (*model.BudgetCategories, error) {
	var category model.BudgetCategories

	stmt := postgres.SELECT(table.BudgetCategories.AllColumns).
		FROM(table.BudgetCategories).
		WHERE(
			table.BudgetCategories.ID.EQ(postgres.UUID(id)).
				AND(table.BudgetCategories.DeletedAt.IS_NULL()),
		)

	err := stmt.QueryContext(ctx, r.db, &category)
	if err != nil {
		return nil, err
	}

	return &category, nil
}

func (r *BudgetRepository) GetSpendingByCategory(
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

func (r *BudgetRepository) Create(
	ctx context.Context,
	category *model.BudgetCategories,
) (*model.BudgetCategories, error) {
	var created model.BudgetCategories

	stmt := table.BudgetCategories.
		INSERT(
			table.BudgetCategories.HouseholdID,
			table.BudgetCategories.Name,
			table.BudgetCategories.Amount,
			table.BudgetCategories.SortOrder,
		).
		VALUES(
			category.HouseholdID,
			category.Name,
			category.Amount,
			category.SortOrder,
		).
		RETURNING(table.BudgetCategories.AllColumns)

	err := stmt.QueryContext(ctx, r.db, &created)
	if err != nil {
		return nil, err
	}

	return &created, nil
}

func (r *BudgetRepository) Update(
	ctx context.Context,
	category *model.BudgetCategories,
) (*model.BudgetCategories, error) {
	var updated model.BudgetCategories

	stmt := table.BudgetCategories.
		UPDATE(
			table.BudgetCategories.Name,
			table.BudgetCategories.Amount,
			table.BudgetCategories.SortOrder,
			table.BudgetCategories.UpdatedAt,
		).
		SET(
			category.Name,
			category.Amount,
			category.SortOrder,
			postgres.NOW(),
		).
		WHERE(
			table.BudgetCategories.ID.EQ(postgres.UUID(category.ID)).
				AND(table.BudgetCategories.DeletedAt.IS_NULL()),
		).
		RETURNING(table.BudgetCategories.AllColumns)

	err := stmt.QueryContext(ctx, r.db, &updated)
	if err != nil {
		return nil, err
	}

	return &updated, nil
}

func (r *BudgetRepository) SoftDelete(ctx context.Context, id uuid.UUID) error {
	stmt := table.BudgetCategories.
		UPDATE(table.BudgetCategories.DeletedAt).
		SET(postgres.NOW()).
		WHERE(
			table.BudgetCategories.ID.EQ(postgres.UUID(id)).
				AND(table.BudgetCategories.DeletedAt.IS_NULL()),
		)

	_, err := stmt.ExecContext(ctx, r.db)

	return err
}

func (r *BudgetRepository) RecordHistory(
	ctx context.Context,
	categoryID uuid.UUID,
	amount int64,
	changedBy uuid.UUID,
) error {
	stmt := table.BudgetHistory.
		INSERT(
			table.BudgetHistory.BudgetCategoryID,
			table.BudgetHistory.Amount,
			table.BudgetHistory.ChangedBy,
		).
		VALUES(categoryID, amount, changedBy)

	_, err := stmt.ExecContext(ctx, r.db)

	return err
}
