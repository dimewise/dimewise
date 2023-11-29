package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/teoyi/dimewise/db/dimewise/public/model"
)

func CreateExpense(
	accountID uuid.UUID,
	categoryID uuid.UUID,
	title string,
	description string,
	amount int,
) *model.Expense {
	now := time.Now()
	expense := model.Expense{
		ID:          uuid.New(),
		AccountID:   accountID,
		CategoryID:  categoryID,
		Title:       title,
		Description: description,
		Amount:      int32(amount),
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	return &expense
}

func UpdateExpense(
	expense *model.Expense,
	categoryID uuid.UUID,
	title string,
	description string,
	amount int,
) *model.Expense {
	expense.CategoryID = categoryID
	expense.Title = title
	expense.Description = description
	expense.Amount = int32(amount)
	expense.UpdatedAt = time.Now()

	return expense
}
