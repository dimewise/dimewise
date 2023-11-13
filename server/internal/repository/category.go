package repository

import (
	"github.com/go-jet/jet/v2/qrm"
)

type ICategoryRepository interface {
	// GetCategoryByID(id uuid.UUID) (*model.Category, error)
}

type CategoryRepository struct {
	db *qrm.DB
}

func NewCategoryRepository(db qrm.DB) *CategoryRepository {
	return &CategoryRepository{
		db: &db,
	}
}
