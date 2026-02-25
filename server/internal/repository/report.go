package repository

import (
	"context"
	"database/sql"

	"github.com/go-jet/jet/v2/postgres"
	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/model"
	"dimewise/generated/dimewise/public/table"
)

// ReportWithDetails is a fully joined result of a report with all child data.
type ReportWithDetails struct {
	model.Reports
	MemberSummaries    []model.ReportMemberSummaries
	CategoryBreakdowns []model.ReportCategoryBreakdowns
	LineItems          []ReportLineItemWithSplits
	Transfers          []model.ReportTransfers
}

// ReportLineItemWithSplits joins a line item with its splits.
type ReportLineItemWithSplits struct {
	model.ReportLineItems
	Splits []model.ReportLineItemSplits
}

// ReportReader defines read operations for reports.
type ReportReader interface {
	ListByHousehold(ctx context.Context, householdID uuid.UUID) ([]model.Reports, error)
	GetByID(ctx context.Context, id uuid.UUID) (*ReportWithDetails, error)
	GetByMonthYear(
		ctx context.Context,
		householdID uuid.UUID,
		month, year int,
	) (*model.Reports, error)
	GetTransferByID(ctx context.Context, id uuid.UUID) (*model.ReportTransfers, error)
}

// ReportWriter defines write operations for reports.
type ReportWriter interface {
	Create(ctx context.Context, data *ReportCreateInput) (*ReportWithDetails, error)
	DeleteByMonthYear(ctx context.Context, householdID uuid.UUID, month, year int) error
	MarkTransferPaid(ctx context.Context, transferID uuid.UUID) (*model.ReportTransfers, error)
}

// ReportCreateInput holds all data needed to create a report.
type ReportCreateInput struct {
	Report             model.Reports
	MemberSummaries    []model.ReportMemberSummaries
	CategoryBreakdowns []model.ReportCategoryBreakdowns
	LineItems          []model.ReportLineItems
	LineItemSplits     map[int][]model.ReportLineItemSplits // keyed by line item index
	Transfers          []model.ReportTransfers
}

// ReportRepository implements ReportReader and ReportWriter.
type ReportRepository struct {
	db *sql.DB
}

func NewReportRepository(db *sql.DB) *ReportRepository {
	return &ReportRepository{db: db}
}

func (r *ReportRepository) ListByHousehold(
	ctx context.Context,
	householdID uuid.UUID,
) ([]model.Reports, error) {
	var reports []model.Reports

	stmt := postgres.SELECT(table.Reports.AllColumns).
		FROM(table.Reports).
		WHERE(table.Reports.HouseholdID.EQ(postgres.UUID(householdID))).
		ORDER_BY(table.Reports.Year.DESC(), table.Reports.Month.DESC())

	err := stmt.QueryContext(ctx, r.db, &reports)
	if err != nil {
		return nil, err
	}

	return reports, nil
}

func (r *ReportRepository) GetByID(
	ctx context.Context,
	id uuid.UUID,
) (*ReportWithDetails, error) {
	// Fetch report
	var report model.Reports

	stmt := postgres.SELECT(table.Reports.AllColumns).
		FROM(table.Reports).
		WHERE(table.Reports.ID.EQ(postgres.UUID(id)))

	err := stmt.QueryContext(ctx, r.db, &report)
	if err != nil {
		return nil, err
	}

	reportUUID := postgres.UUID(id)

	// Fetch member summaries
	var members []model.ReportMemberSummaries

	memberStmt := postgres.SELECT(table.ReportMemberSummaries.AllColumns).
		FROM(table.ReportMemberSummaries).
		WHERE(table.ReportMemberSummaries.ReportID.EQ(reportUUID)).
		ORDER_BY(table.ReportMemberSummaries.NetBalance.ASC())

	err = memberStmt.QueryContext(ctx, r.db, &members)
	if err != nil {
		return nil, err
	}

	if members == nil {
		members = []model.ReportMemberSummaries{}
	}

	// Fetch category breakdowns
	var categories []model.ReportCategoryBreakdowns

	catStmt := postgres.SELECT(table.ReportCategoryBreakdowns.AllColumns).
		FROM(table.ReportCategoryBreakdowns).
		WHERE(table.ReportCategoryBreakdowns.ReportID.EQ(reportUUID)).
		ORDER_BY(table.ReportCategoryBreakdowns.TotalSpent.DESC())

	err = catStmt.QueryContext(ctx, r.db, &categories)
	if err != nil {
		return nil, err
	}

	if categories == nil {
		categories = []model.ReportCategoryBreakdowns{}
	}

	// Fetch line items
	var lineItems []model.ReportLineItems

	liStmt := postgres.SELECT(table.ReportLineItems.AllColumns).
		FROM(table.ReportLineItems).
		WHERE(table.ReportLineItems.ReportID.EQ(reportUUID)).
		ORDER_BY(table.ReportLineItems.IncurredAt.DESC())

	err = liStmt.QueryContext(ctx, r.db, &lineItems)
	if err != nil {
		return nil, err
	}

	// Fetch all splits for the line items
	lineItemsWithSplits := make([]ReportLineItemWithSplits, len(lineItems))
	lineItemMap := make(map[uuid.UUID]*ReportLineItemWithSplits, len(lineItems))

	if len(lineItems) > 0 {
		liIDs := make([]postgres.Expression, len(lineItems))
		for i, li := range lineItems {
			liIDs[i] = postgres.UUID(li.ID)
			lineItemsWithSplits[i] = ReportLineItemWithSplits{
				ReportLineItems: li,
				Splits:          []model.ReportLineItemSplits{},
			}
			lineItemMap[li.ID] = &lineItemsWithSplits[i]
		}

		var splits []model.ReportLineItemSplits

		splitStmt := postgres.SELECT(table.ReportLineItemSplits.AllColumns).
			FROM(table.ReportLineItemSplits).
			WHERE(table.ReportLineItemSplits.LineItemID.IN(liIDs...))

		err = splitStmt.QueryContext(ctx, r.db, &splits)
		if err != nil {
			return nil, err
		}

		for _, split := range splits {
			if li, ok := lineItemMap[split.LineItemID]; ok {
				li.Splits = append(li.Splits, split)
			}
		}
	}

	// Fetch transfers
	var transfers []model.ReportTransfers

	transferStmt := postgres.SELECT(table.ReportTransfers.AllColumns).
		FROM(table.ReportTransfers).
		WHERE(table.ReportTransfers.ReportID.EQ(reportUUID)).
		ORDER_BY(table.ReportTransfers.Amount.DESC())

	err = transferStmt.QueryContext(ctx, r.db, &transfers)
	if err != nil {
		return nil, err
	}

	if transfers == nil {
		transfers = []model.ReportTransfers{}
	}

	return &ReportWithDetails{
		Reports:            report,
		MemberSummaries:    members,
		CategoryBreakdowns: categories,
		LineItems:          lineItemsWithSplits,
		Transfers:          transfers,
	}, nil
}

func (r *ReportRepository) GetByMonthYear(
	ctx context.Context,
	householdID uuid.UUID,
	month, year int,
) (*model.Reports, error) {
	var report model.Reports

	stmt := postgres.SELECT(table.Reports.AllColumns).
		FROM(table.Reports).
		WHERE(
			table.Reports.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.Reports.Month.EQ(postgres.Int32(int32(month)))).
				AND(table.Reports.Year.EQ(postgres.Int32(int32(year)))),
		)

	err := stmt.QueryContext(ctx, r.db, &report)
	if err != nil {
		return nil, err
	}

	return &report, nil
}

func (r *ReportRepository) GetTransferByID(
	ctx context.Context,
	id uuid.UUID,
) (*model.ReportTransfers, error) {
	var transfer model.ReportTransfers

	stmt := postgres.SELECT(table.ReportTransfers.AllColumns).
		FROM(table.ReportTransfers).
		WHERE(table.ReportTransfers.ID.EQ(postgres.UUID(id)))

	err := stmt.QueryContext(ctx, r.db, &transfer)
	if err != nil {
		return nil, err
	}

	return &transfer, nil
}

func (r *ReportRepository) DeleteByMonthYear(
	ctx context.Context,
	householdID uuid.UUID,
	month, year int,
) error {
	stmt := table.Reports.
		DELETE().
		WHERE(
			table.Reports.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.Reports.Month.EQ(postgres.Int32(int32(month)))).
				AND(table.Reports.Year.EQ(postgres.Int32(int32(year)))),
		)

	_, err := stmt.ExecContext(ctx, r.db)

	return err
}

func (r *ReportRepository) Create(
	ctx context.Context,
	data *ReportCreateInput,
) (*ReportWithDetails, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	defer func() { _ = tx.Rollback() }()

	// Insert report
	var created model.Reports

	insertReport := table.Reports.
		INSERT(
			table.Reports.HouseholdID,
			table.Reports.Month,
			table.Reports.Year,
			table.Reports.TotalExpenses,
			table.Reports.TotalAmount,
		).
		VALUES(
			data.Report.HouseholdID,
			data.Report.Month,
			data.Report.Year,
			data.Report.TotalExpenses,
			data.Report.TotalAmount,
		).
		RETURNING(table.Reports.AllColumns)

	err = insertReport.QueryContext(ctx, tx, &created)
	if err != nil {
		return nil, err
	}

	// Insert member summaries
	createdMembers := make([]model.ReportMemberSummaries, 0, len(data.MemberSummaries))

	for _, ms := range data.MemberSummaries {
		var cm model.ReportMemberSummaries

		insertMS := table.ReportMemberSummaries.
			INSERT(
				table.ReportMemberSummaries.ReportID,
				table.ReportMemberSummaries.UserID,
				table.ReportMemberSummaries.MemberName,
				table.ReportMemberSummaries.TotalPaid,
				table.ReportMemberSummaries.TotalOwed,
				table.ReportMemberSummaries.NetBalance,
			).
			VALUES(created.ID, ms.UserID, ms.MemberName, ms.TotalPaid, ms.TotalOwed, ms.NetBalance).
			RETURNING(table.ReportMemberSummaries.AllColumns)

		err = insertMS.QueryContext(ctx, tx, &cm)
		if err != nil {
			return nil, err
		}

		createdMembers = append(createdMembers, cm)
	}

	// Insert category breakdowns
	createdCats := make([]model.ReportCategoryBreakdowns, 0, len(data.CategoryBreakdowns))

	for _, cb := range data.CategoryBreakdowns {
		var cc model.ReportCategoryBreakdowns

		insertCB := table.ReportCategoryBreakdowns.
			INSERT(
				table.ReportCategoryBreakdowns.ReportID,
				table.ReportCategoryBreakdowns.CategoryName,
				table.ReportCategoryBreakdowns.BudgetAmount,
				table.ReportCategoryBreakdowns.TotalSpent,
			).
			VALUES(created.ID, cb.CategoryName, cb.BudgetAmount, cb.TotalSpent).
			RETURNING(table.ReportCategoryBreakdowns.AllColumns)

		err = insertCB.QueryContext(ctx, tx, &cc)
		if err != nil {
			return nil, err
		}

		createdCats = append(createdCats, cc)
	}

	// Insert line items and their splits
	createdLineItems := make([]ReportLineItemWithSplits, 0, len(data.LineItems))

	for i, li := range data.LineItems {
		var cli model.ReportLineItems

		insertLI := table.ReportLineItems.
			INSERT(
				table.ReportLineItems.ReportID,
				table.ReportLineItems.ExpenseID,
				table.ReportLineItems.ExpenseTitle,
				table.ReportLineItems.CategoryName,
				table.ReportLineItems.PaidByUserID,
				table.ReportLineItems.PaidByName,
				table.ReportLineItems.Amount,
				table.ReportLineItems.IncurredAt,
				table.ReportLineItems.Notes,
			).
			VALUES(
				created.ID,
				li.ExpenseID,
				li.ExpenseTitle,
				li.CategoryName,
				li.PaidByUserID,
				li.PaidByName,
				li.Amount,
				li.IncurredAt,
				li.Notes,
			).
			RETURNING(table.ReportLineItems.AllColumns)

		err = insertLI.QueryContext(ctx, tx, &cli)
		if err != nil {
			return nil, err
		}

		liWithSplits := ReportLineItemWithSplits{
			ReportLineItems: cli,
			Splits:          []model.ReportLineItemSplits{},
		}

		// Insert splits for this line item
		if splits, ok := data.LineItemSplits[i]; ok {
			for _, s := range splits {
				var cs model.ReportLineItemSplits

				insertSplit := table.ReportLineItemSplits.
					INSERT(
						table.ReportLineItemSplits.LineItemID,
						table.ReportLineItemSplits.UserID,
						table.ReportLineItemSplits.MemberName,
						table.ReportLineItemSplits.Amount,
					).
					VALUES(cli.ID, s.UserID, s.MemberName, s.Amount).
					RETURNING(table.ReportLineItemSplits.AllColumns)

				err = insertSplit.QueryContext(ctx, tx, &cs)
				if err != nil {
					return nil, err
				}

				liWithSplits.Splits = append(liWithSplits.Splits, cs)
			}
		}

		createdLineItems = append(createdLineItems, liWithSplits)
	}

	// Insert transfers
	createdTransfers := make([]model.ReportTransfers, 0, len(data.Transfers))

	for _, t := range data.Transfers {
		var ct model.ReportTransfers

		insertTransfer := table.ReportTransfers.
			INSERT(
				table.ReportTransfers.ReportID,
				table.ReportTransfers.FromUserID,
				table.ReportTransfers.ToUserID,
				table.ReportTransfers.FromName,
				table.ReportTransfers.ToName,
				table.ReportTransfers.Amount,
			).
			VALUES(created.ID, t.FromUserID, t.ToUserID, t.FromName, t.ToName, t.Amount).
			RETURNING(table.ReportTransfers.AllColumns)

		err = insertTransfer.QueryContext(ctx, tx, &ct)
		if err != nil {
			return nil, err
		}

		createdTransfers = append(createdTransfers, ct)
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return &ReportWithDetails{
		Reports:            created,
		MemberSummaries:    createdMembers,
		CategoryBreakdowns: createdCats,
		LineItems:          createdLineItems,
		Transfers:          createdTransfers,
	}, nil
}

func (r *ReportRepository) MarkTransferPaid(
	ctx context.Context,
	transferID uuid.UUID,
) (*model.ReportTransfers, error) {
	var updated model.ReportTransfers

	stmt := table.ReportTransfers.
		UPDATE(
			table.ReportTransfers.PaidAt,
			table.ReportTransfers.UpdatedAt,
		).
		SET(
			postgres.NOW(),
			postgres.NOW(),
		).
		WHERE(table.ReportTransfers.ID.EQ(postgres.UUID(transferID))).
		RETURNING(table.ReportTransfers.AllColumns)

	err := stmt.QueryContext(ctx, r.db, &updated)
	if err != nil {
		return nil, err
	}

	return &updated, nil
}
