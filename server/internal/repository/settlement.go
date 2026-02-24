package repository

import (
	"context"
	"database/sql"

	"github.com/go-jet/jet/v2/postgres"
	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/model"
	"dimewise/generated/dimewise/public/table"
)

// SettlementWithTransfers is a joined result of settlement + its transfers.
type SettlementWithTransfers struct {
	model.Settlements
	Transfers []model.SettlementTransfers
}

// SettlementReader defines read operations for settlements.
type SettlementReader interface {
	ListByHousehold(ctx context.Context, householdID uuid.UUID) ([]model.Settlements, error)
	GetByID(ctx context.Context, id uuid.UUID) (*SettlementWithTransfers, error)
	GetByMonthYear(
		ctx context.Context,
		householdID uuid.UUID,
		month, year int,
	) (*model.Settlements, error)
	GetTransferByID(ctx context.Context, id uuid.UUID) (*model.SettlementTransfers, error)
}

// SettlementWriter defines write operations for settlements.
type SettlementWriter interface {
	Create(
		ctx context.Context,
		settlement *model.Settlements,
		transfers []model.SettlementTransfers,
	) (*SettlementWithTransfers, error)
	MarkTransferPaid(ctx context.Context, transferID uuid.UUID) (*model.SettlementTransfers, error)
}

// SettlementRepository implements SettlementReader and SettlementWriter.
type SettlementRepository struct {
	db *sql.DB
}

func NewSettlementRepository(db *sql.DB) *SettlementRepository {
	return &SettlementRepository{db: db}
}

func (r *SettlementRepository) ListByHousehold(
	ctx context.Context,
	householdID uuid.UUID,
) ([]model.Settlements, error) {
	var settlements []model.Settlements

	stmt := postgres.SELECT(table.Settlements.AllColumns).
		FROM(table.Settlements).
		WHERE(table.Settlements.HouseholdID.EQ(postgres.UUID(householdID))).
		ORDER_BY(table.Settlements.Year.DESC(), table.Settlements.Month.DESC())

	err := stmt.QueryContext(ctx, r.db, &settlements)
	if err != nil {
		return nil, err
	}

	return settlements, nil
}

func (r *SettlementRepository) GetByID(
	ctx context.Context,
	id uuid.UUID,
) (*SettlementWithTransfers, error) {
	var settlement model.Settlements

	stmt := postgres.SELECT(table.Settlements.AllColumns).
		FROM(table.Settlements).
		WHERE(table.Settlements.ID.EQ(postgres.UUID(id)))

	err := stmt.QueryContext(ctx, r.db, &settlement)
	if err != nil {
		return nil, err
	}

	var transfers []model.SettlementTransfers

	transferStmt := postgres.SELECT(table.SettlementTransfers.AllColumns).
		FROM(table.SettlementTransfers).
		WHERE(table.SettlementTransfers.SettlementID.EQ(postgres.UUID(id))).
		ORDER_BY(table.SettlementTransfers.Amount.DESC())

	err = transferStmt.QueryContext(ctx, r.db, &transfers)
	if err != nil {
		return nil, err
	}

	if transfers == nil {
		transfers = []model.SettlementTransfers{}
	}

	return &SettlementWithTransfers{
		Settlements: settlement,
		Transfers:   transfers,
	}, nil
}

func (r *SettlementRepository) GetByMonthYear(
	ctx context.Context,
	householdID uuid.UUID,
	month, year int,
) (*model.Settlements, error) {
	var settlement model.Settlements

	stmt := postgres.SELECT(table.Settlements.AllColumns).
		FROM(table.Settlements).
		WHERE(
			table.Settlements.HouseholdID.EQ(postgres.UUID(householdID)).
				AND(table.Settlements.Month.EQ(postgres.Int32(int32(month)))).
				AND(table.Settlements.Year.EQ(postgres.Int32(int32(year)))),
		)

	err := stmt.QueryContext(ctx, r.db, &settlement)
	if err != nil {
		return nil, err
	}

	return &settlement, nil
}

func (r *SettlementRepository) GetTransferByID(
	ctx context.Context,
	id uuid.UUID,
) (*model.SettlementTransfers, error) {
	var transfer model.SettlementTransfers

	stmt := postgres.SELECT(table.SettlementTransfers.AllColumns).
		FROM(table.SettlementTransfers).
		WHERE(table.SettlementTransfers.ID.EQ(postgres.UUID(id)))

	err := stmt.QueryContext(ctx, r.db, &transfer)
	if err != nil {
		return nil, err
	}

	return &transfer, nil
}

func (r *SettlementRepository) Create(
	ctx context.Context,
	settlement *model.Settlements,
	transfers []model.SettlementTransfers,
) (*SettlementWithTransfers, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}

	defer func() { _ = tx.Rollback() }()

	var created model.Settlements

	insertStmt := table.Settlements.
		INSERT(
			table.Settlements.HouseholdID,
			table.Settlements.Month,
			table.Settlements.Year,
		).
		VALUES(
			settlement.HouseholdID,
			settlement.Month,
			settlement.Year,
		).
		RETURNING(table.Settlements.AllColumns)

	err = insertStmt.QueryContext(ctx, tx, &created)
	if err != nil {
		return nil, err
	}

	createdTransfers := make([]model.SettlementTransfers, 0, len(transfers))

	for _, t := range transfers {
		var ct model.SettlementTransfers

		insertTransfer := table.SettlementTransfers.
			INSERT(
				table.SettlementTransfers.SettlementID,
				table.SettlementTransfers.FromUserID,
				table.SettlementTransfers.ToUserID,
				table.SettlementTransfers.Amount,
			).
			VALUES(created.ID, t.FromUserID, t.ToUserID, t.Amount).
			RETURNING(table.SettlementTransfers.AllColumns)

		err = insertTransfer.QueryContext(ctx, tx, &ct)
		if err != nil {
			return nil, err
		}

		createdTransfers = append(createdTransfers, ct)
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return &SettlementWithTransfers{
		Settlements: created,
		Transfers:   createdTransfers,
	}, nil
}

func (r *SettlementRepository) MarkTransferPaid(
	ctx context.Context,
	transferID uuid.UUID,
) (*model.SettlementTransfers, error) {
	var updated model.SettlementTransfers

	stmt := table.SettlementTransfers.
		UPDATE(
			table.SettlementTransfers.PaidAt,
			table.SettlementTransfers.UpdatedAt,
		).
		SET(
			postgres.NOW(),
			postgres.NOW(),
		).
		WHERE(table.SettlementTransfers.ID.EQ(postgres.UUID(transferID))).
		RETURNING(table.SettlementTransfers.AllColumns)

	err := stmt.QueryContext(ctx, r.db, &updated)
	if err != nil {
		return nil, err
	}

	return &updated, nil
}
