package repository

import (
	. "github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"
	"github.com/teoyi/dimewise/db/dimewise/public/model"
	"github.com/teoyi/dimewise/db/dimewise/public/table"
	lerrors "github.com/teoyi/dimewise/internal/util/errors"
)

type ICategoryRepository interface {
	CreateCategoryByModel(category *model.Category) (*model.Category, error)
	GetCategoryByID(categoryID uuid.UUID) (*model.Category, error)
	GetCategoryByAccountID(accountID uuid.UUID) (*[]model.Category, error)
	UpdateCategoryByModel(category *model.Category) (*model.Category, error)
	DeleteCategoryByID(categoryID uuid.UUID) (*model.Category, error)
}

type categoryRepository struct {
	db *qrm.DB
}

func NewCategoryRepository(db qrm.DB) ICategoryRepository {
	return &categoryRepository{
		db: &db,
	}
}

func (r *categoryRepository) CreateCategoryByModel(category *model.Category) (*model.Category, error) {
	tbl := table.Category
	stmt := tbl.INSERT(tbl.MutableColumns).MODEL(category).RETURNING(tbl.AllColumns)

	dest := []model.Category{}
	err := stmt.Query(*r.db, &dest)
	if err != nil {
		return nil, err
	}

	if len(dest) != 1 {
		return nil, lerrors.ErrResourceNotFound
	}

	insertedCategory := dest[0]
	return &insertedCategory, nil
}

func (r *categoryRepository) GetCategoryByID(categoryID uuid.UUID) (*model.Category, error) {
	tbl := table.Category
	stmt := SELECT(tbl.AllColumns).FROM(tbl).WHERE(tbl.ID.EQ(UUID(categoryID))).LIMIT(1)

	rows := []model.Category{}
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

func (r *categoryRepository) GetCategoryByAccountID(accountID uuid.UUID) (*[]model.Category, error) {
	tbl := table.Category
	stmt := SELECT(tbl.AllColumns).FROM(tbl).WHERE(tbl.AccountID.EQ(UUID(accountID)))

	rows := []model.Category{}
	err := stmt.Query(*r.db, &rows)
	if err != nil {
		return nil, err
	}

	return &rows, nil
}

func (r *categoryRepository) UpdateCategoryByModel(category *model.Category) (*model.Category, error) {
	tbl := table.Category
	stmt := tbl.UPDATE(tbl.MutableColumns).MODEL(category).WHERE(tbl.ID.EQ(UUID(category.ID))).RETURNING(tbl.AllColumns)

	rows := []model.Category{}
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

func (r *categoryRepository) DeleteCategoryByID(categoryID uuid.UUID) (*model.Category, error) {
	tbl := table.Category
	stmt := tbl.DELETE().WHERE(tbl.ID.EQ(UUID(categoryID))).RETURNING(tbl.AllColumns)

	rows := []model.Category{}
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
