package repository

import (
	"context"
	"time"

	"github.com/go-errors/errors"
	"github.com/go-jet/jet/v2/postgres"
	"github.com/go-jet/jet/v2/qrm"
	"github.com/google/uuid"

	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/generated/dimewise/public/table"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/app/dto"
)

// GetTotalBudgetByUserID returns the sum of all category amounts for a user
func GetTotalBudgetByUserID(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
) (*dto.BudgetSumResult, error) {
	categoryTbl := table.Category.AS("category")
	categoryStmt := postgres.SELECT(postgres.SUM(categoryTbl.Amount).AS("category.sum")).
		FROM(categoryTbl).
		WHERE(categoryTbl.UserID.EQ(postgres.UUID(userID)).
			AND(categoryTbl.DeletedAt.IS_NULL()))

	var result dto.BudgetSumResult
	err := categoryStmt.QueryContext(ctx, db, &result)
	if err != nil {
		return nil, errors.Errorf("failed to get total budget: %w", err)
	}

	// SUM always returns one row (even if NULL), so we can return the result directly
	return &result, nil
}

// GetTotalSpentByUserIDAndDateRange returns the sum of all expense amounts for a user within a date range
func GetTotalSpentByUserIDAndDateRange(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	startDate time.Time,
	endDate time.Time,
) (*dto.SpentSumResult, error) {
	expenseTbl := table.Expense.AS("expense")
	expenseStmt := postgres.SELECT(postgres.SUM(expenseTbl.Amount).AS("expense.sum")).
		FROM(expenseTbl).
		WHERE(expenseTbl.UserID.EQ(postgres.UUID(userID)).
			AND(expenseTbl.IncurredAt.GT_EQ(postgres.TimestampzT(startDate))).
			AND(expenseTbl.IncurredAt.LT(postgres.TimestampzT(endDate))))

	var result dto.SpentSumResult
	err := expenseStmt.QueryContext(ctx, db, &result)
	if err != nil {
		return nil, errors.Errorf("failed to get total spent: %w", err)
	}

	// SUM always returns one row (even if NULL), so we can return the result directly
	return &result, nil
}

// GetCategoriesBreakdown returns categories with their budget and spent amounts for a user within a date range
func GetCategoriesBreakdown(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	startDate time.Time,
	endDate time.Time,
) (*[]dto.CategoryBreakdownResult, error) {
	categoryTbl := table.Category.AS("category")
	expenseTbl := table.Expense.AS("expense")

	// Query to get categories with their budget and spent amounts
	stmt := categoryTbl.SELECT(
		categoryTbl.ID.AS("category.id"),
		categoryTbl.Title.AS("category.title"),
		categoryTbl.Amount.AS("category.amount"),
		postgres.COALESCE(postgres.SUM(expenseTbl.Amount), postgres.Int(0)).AS("expense.spent"),
	).FROM(
		categoryTbl.
			LEFT_JOIN(expenseTbl, expenseTbl.CategoryID.EQ(categoryTbl.ID).
				AND(expenseTbl.UserID.EQ(postgres.UUID(userID))).
				AND(expenseTbl.IncurredAt.GT_EQ(postgres.TimestampzT(startDate))).
				AND(expenseTbl.IncurredAt.LT(postgres.TimestampzT(endDate)))),
	).
		WHERE(categoryTbl.UserID.EQ(postgres.UUID(userID)).
			AND(categoryTbl.DeletedAt.IS_NULL())).
		GROUP_BY(categoryTbl.ID, categoryTbl.Title, categoryTbl.Amount)

	results := []dto.CategoryBreakdownResult{}
	err := stmt.QueryContext(ctx, db, &results)
	if err != nil {
		return nil, errors.Errorf("failed to get categories breakdown: %w", err)
	}

	return &results, nil
}

func GetPaymentMethodsBreakdown(
	ctx context.Context,
	db qrm.DB,
	userID uuid.UUID,
	params oapi.GetAnalyticsPaymentMethodsBreakdownParams,
) (*[]dto.PaymentMethodBreakdown, error) {
	// Set default values
	month := time.Now().Month()
	year := time.Now().Year()
	if params.Month != nil {
		month = time.Month(*params.Month)
	}
	if params.Year != nil {
		year = *params.Year
	}

	// Calculate date range for the month
	startDate := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	var endDate time.Time
	if month == 12 {
		endDate = time.Date(year+1, 1, 1, 0, 0, 0, 0, time.UTC)
	} else {
		endDate = time.Date(year, month+1, 1, 0, 0, 0, 0, time.UTC)
	}

	// Get user's currency from user table
	userTbl := table.User
	userStmt := userTbl.SELECT(userTbl.AllColumns).
		WHERE(userTbl.ID.EQ(postgres.UUID(userID)))

	userDest := []model.User{}
	err := userStmt.QueryContext(ctx, db, &userDest)
	if err != nil {
		return nil, errors.Errorf("failed to get user currency: %w", err)
	}
	if len(userDest) == 0 {
		return nil, errors.Errorf("user not found")
	}
	currency := string(userDest[0].Currency)

	// Get payment methods with their spending breakdown
	paymentTbl := table.PaymentMethod
	expenseTbl := table.Expense

	// Query to get payment methods with their total spent amounts
	stmt := paymentTbl.SELECT(
		paymentTbl.ID,
		paymentTbl.Title,
		postgres.COALESCE(postgres.SUM(expenseTbl.Amount), postgres.Int(0)).AS("total_spent"),
	).FROM(
		paymentTbl.
			LEFT_JOIN(expenseTbl, expenseTbl.PaymentMethodID.EQ(paymentTbl.ID).
				AND(expenseTbl.UserID.EQ(postgres.UUID(userID))).
				AND(expenseTbl.IncurredAt.GT_EQ(postgres.TimestampzT(startDate))).
				AND(expenseTbl.IncurredAt.LT(postgres.TimestampzT(endDate)))),
	).
		WHERE(paymentTbl.UserID.EQ(postgres.UUID(userID)).
			AND(paymentTbl.DeletedAt.IS_NULL())).
		GROUP_BY(paymentTbl.ID, paymentTbl.Title)

	type PaymentMethodBreakdownResult struct {
		ID         uuid.UUID `sql:"id"`
		Title      string    `sql:"title"`
		TotalSpent int64     `sql:"total_spent"`
	}

	results := []PaymentMethodBreakdownResult{}
	err = stmt.QueryContext(ctx, db, &results)
	if err != nil {
		return nil, errors.Errorf("failed to get payment methods breakdown: %w", err)
	}

	// Convert to DTO
	breakdown := make([]dto.PaymentMethodBreakdown, len(results))
	for i, result := range results {
		breakdown[i] = dto.PaymentMethodBreakdown{
			PaymentMethodID:    result.ID,
			PaymentMethodTitle: result.Title,
			TotalSpent:         int(result.TotalSpent),
			Currency:           currency,
		}
	}

	return &breakdown, nil
}
