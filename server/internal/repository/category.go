package repository

import (
	"github.com/go-jet/jet/v2/qrm"
	"github.com/teoyi/dimewise/db/dimewise/public/model"
	"github.com/teoyi/dimewise/db/dimewise/public/table"
	lerrors "github.com/teoyi/dimewise/internal/util/errors"
)

type ICategoryRepository interface {
	CreateCategoryByModel(category *model.Category) (*model.Category, error)
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
