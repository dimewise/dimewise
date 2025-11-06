package dto

// BudgetSumResult represents the result of a SUM query for total budget
type BudgetSumResult struct {
	Sum *int64 `alias:"category.sum"`
}

// SpentSumResult represents the result of a SUM query for total spent
type SpentSumResult struct {
	Sum *int64 `alias:"expense.sum"`
}
