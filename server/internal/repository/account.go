package repository

import (
	. "github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
	"github.com/teoyi/dimewise/db/dimewise/public/model"
	"github.com/teoyi/dimewise/db/dimewise/public/table"
	lerrors "github.com/teoyi/dimewise/internal/util/errors"
)

type IAccountRepository interface {
	GetAccountByExternalID(externalID string) (*model.Account, error)
	GetAccountByExternalIDOrEmail(externalID string, email string) (*model.Account, error)
	CreateAccountByModel(account *model.Account) (*model.Account, error)
}

type accountRepository struct {
	db *qrm.DB
}

func NewAccountRepository(db qrm.DB) IAccountRepository {
	return &accountRepository{
		db: &db,
	}
}

func (r *accountRepository) GetAccountByExternalID(externalID string) (*model.Account, error) {
	tbl := table.Account
	stmt := tbl.SELECT(tbl.AllColumns).
		FROM(tbl).
		WHERE(tbl.ExternalID.EQ(String(externalID))).
		LIMIT(1)

	rows := []model.Account{}
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

func (r *accountRepository) GetAccountByExternalIDOrEmail(externalID string, email string) (*model.Account, error) {
	tbl := table.Account
	stmt := tbl.SELECT(tbl.AllColumns).
		FROM(tbl).
		WHERE(tbl.ExternalID.EQ(String(externalID)).OR(tbl.Email.EQ(String(email)))).
		LIMIT(1)

	rows := []model.Account{}
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

func (r *accountRepository) CreateAccountByModel(account *model.Account) (*model.Account, error) {
	tbl := table.Account
	stmt := tbl.INSERT(tbl.MutableColumns).MODEL(account).RETURNING(tbl.AllColumns)

	dest := []model.Account{}
	err := stmt.Query(*r.db, &dest)
	if err != nil {
		return nil, err
	}

	if len(dest) != 1 {
		return nil, lerrors.ErrResourceNotFound
	}

	insertedAccount := dest[0]
	return &insertedAccount, nil
}
