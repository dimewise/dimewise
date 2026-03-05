package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/go-jet/jet/v2/postgres"
	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/table"
)

// ReportListItem holds a month/year with expense totals and optional closed_at.
type ReportListItem struct {
	Month         int32
	Year          int32
	TotalExpenses int32
	TotalAmount   int64
	ClosedAt      *time.Time
}

// ReportReader defines read operations for reports.
type ReportReader interface {
	ListAvailableMonths(ctx context.Context, householdID uuid.UUID) ([]ReportListItem, error)
	GetClosedAt(ctx context.Context, householdID uuid.UUID, month, year int) (*time.Time, error)
}

// ReportWriter defines write operations for reports.
type ReportWriter interface {
	Close(ctx context.Context, householdID uuid.UUID, month, year int) (*time.Time, error)
	Reopen(ctx context.Context, householdID uuid.UUID, month, year int) error
}

// ReportRepository implements ReportReader and ReportWriter.
type ReportRepository struct {
	db *sql.DB
}

func NewReportRepository(db *sql.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

func (r *ReportRepository) ListAvailableMonths(
	ctx context.Context,
	householdID uuid.UUID,
) ([]ReportListItem, error) {
	// Use raw SQL since go-jet's EXTRACT support is limited.
	stmt := postgres.RawStatement(`
		SELECT
			EXTRACT(MONTH FROM e.incurred_at)::int AS "report_list_item.month",
			EXTRACT(YEAR FROM e.incurred_at)::int  AS "report_list_item.year",
			COUNT(*)::int                           AS "report_list_item.total_expenses",
			COALESCE(SUM(e.amount), 0)              AS "report_list_item.total_amount",
			r.closed_at                             AS "report_list_item.closed_at"
		FROM expenses e
		LEFT JOIN reports r
			ON r.household_id = e.household_id
			AND r.month = EXTRACT(MONTH FROM e.incurred_at)::int
			AND r.year = EXTRACT(YEAR FROM e.incurred_at)::int
		WHERE e.household_id = #householdID::uuid
		GROUP BY
			EXTRACT(MONTH FROM e.incurred_at),
			EXTRACT(YEAR FROM e.incurred_at),
			r.closed_at
		ORDER BY
			EXTRACT(YEAR FROM e.incurred_at) DESC,
			EXTRACT(MONTH FROM e.incurred_at) DESC
	`, postgres.RawArgs{
		"#householdID": householdID,
	})

	var rows []ReportListItem

	err := stmt.QueryContext(ctx, r.db, &rows)
	if err != nil {
		return nil, err
	}

	return rows, nil
}

func (r *ReportRepository) GetClosedAt(
	ctx context.Context,
	householdID uuid.UUID,
	month, year int,
) (*time.Time, error) {
	monthInt := int32(month) //nolint:gosec // month is 1-12
	yearInt := int32(year)   //nolint:gosec // year is validated >= 2020

	var result struct {
		ClosedAt *time.Time `alias:"reports.closed_at"`
	}

	stmt := postgres.SELECT(table.Reports.ClosedAt).
		FROM(table.Reports).
		WHERE(
			table.Reports.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.Reports.Month.EQ(postgres.Int32(monthInt))).
				AND(table.Reports.Year.EQ(postgres.Int32(yearInt))),
		)

	err := stmt.QueryContext(ctx, r.db, &result)
	if err != nil {
		return nil, err
	}

	return result.ClosedAt, nil
}

func (r *ReportRepository) Close(
	ctx context.Context,
	householdID uuid.UUID,
	month, year int,
) (*time.Time, error) {
	monthInt := int32(month) //nolint:gosec // month is 1-12
	yearInt := int32(year)   //nolint:gosec // year is validated >= 2020

	var result struct {
		ClosedAt *time.Time
	}

	// UPSERT: insert or update closed_at to NOW()
	stmt := postgres.RawStatement(`
		INSERT INTO reports (household_id, month, year, closed_at)
		VALUES (#householdID::uuid, #month, #year, NOW())
		ON CONFLICT (household_id, month, year)
		DO UPDATE SET closed_at = NOW(), updated_at = NOW()
		RETURNING closed_at
	`, postgres.RawArgs{
		"#householdID": householdID,
		"#month":       monthInt,
		"#year":        yearInt,
	})

	err := stmt.QueryContext(ctx, r.db, &result)
	if err != nil {
		return nil, err
	}

	return result.ClosedAt, nil
}

func (r *ReportRepository) Reopen(
	ctx context.Context,
	householdID uuid.UUID,
	month, year int,
) error {
	monthInt := int32(month) //nolint:gosec // month is 1-12
	yearInt := int32(year)   //nolint:gosec // year is validated >= 2020

	stmt := table.Reports.
		UPDATE(table.Reports.ClosedAt, table.Reports.UpdatedAt).
		SET(postgres.NULL, postgres.NOW()).
		WHERE(
			table.Reports.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.Reports.Month.EQ(postgres.Int32(monthInt))).
				AND(table.Reports.Year.EQ(postgres.Int32(yearInt))),
		)

	_, err := stmt.ExecContext(ctx, r.db)

	return err
}
