package dto

import "github.com/google/uuid"

// BudgetSumResult represents the result of a SUM query for total budget
type BudgetSumResult struct {
	Sum *int64 `alias:"category.sum"`
}

// SpentSumResult represents the result of a SUM query for total spent
type SpentSumResult struct {
	Sum *int64 `alias:"expense.sum"`
}

// CategoryBreakdownResult represents the result of a category breakdown query
type CategoryBreakdownResult struct {
	ID     uuid.UUID `alias:"category.id"`
	Title  string    `alias:"category.title"`
	Budget int64     `alias:"category.amount"`
	Spent  int64     `alias:"expense.spent"`
}

// PaymentMethodBreakdownResult represents the result of a payment method breakdown query
type PaymentMethodBreakdownResult struct {
	ID         uuid.UUID `alias:"payment_method.id"`
	Title      string    `alias:"payment_method.title"`
	TotalSpent int64     `alias:"expense.total_spent"`
}
