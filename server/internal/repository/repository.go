package repository

import (
	"github.com/go-jet/jet/v2/qrm"
)

type Repository struct {
	Account  IAccountRepository
	Category ICategoryRepository
	Expense  IExpenseRepository
}

func NewRepository(db qrm.DB) *Repository {
	accountRepo := NewAccountRepository(db)
	categoryRepo := NewCategoryRepository(db)
	expenseRepo := NewExpenseRepository(db)

	return &Repository{
		Account:  accountRepo,
		Category: categoryRepo,
		Expense:  expenseRepo,
	}
}
