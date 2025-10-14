package dto

import (
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/google/uuid"
)

// BudgetOverview represents budget overview data
type BudgetOverview struct {
	TotalBudget     int    `json:"total_budget"`
	TotalSpent      int    `json:"total_spent"`
	RemainingBudget int    `json:"remaining_budget"`
	Currency        string `json:"currency"`
	Month           int    `json:"month"`
	Year            int    `json:"year"`
}

// CategoryBreakdown represents category spending breakdown
type CategoryBreakdown struct {
	CategoryID    uuid.UUID `json:"category_id"`
	CategoryTitle string    `json:"category_title"`
	Budget        int       `json:"budget"`
	Spent         int       `json:"spent"`
	Remaining     int       `json:"remaining"`
	Currency      string    `json:"currency"`
}

// PaymentMethodBreakdown represents payment method spending breakdown
type PaymentMethodBreakdown struct {
	PaymentMethodID    uuid.UUID `json:"payment_method_id"`
	PaymentMethodTitle string    `json:"payment_method_title"`
	TotalSpent         int       `json:"total_spent"`
	Currency           string    `json:"currency"`
}

// TransformBudgetOverviewToOAPI converts DTO to OpenAPI type
func TransformBudgetOverviewToOAPI(overview BudgetOverview) oapi.BudgetOverview {
	return oapi.BudgetOverview{
		TotalBudget:     overview.TotalBudget,
		TotalSpent:      overview.TotalSpent,
		RemainingBudget: overview.RemainingBudget,
		Month:           overview.Month,
		Year:            overview.Year,
	}
}

// TransformCategoryBreakdownToOAPI converts DTO to OpenAPI type
func TransformCategoryBreakdownToOAPI(breakdown CategoryBreakdown) oapi.CategoryBreakdown {
	return oapi.CategoryBreakdown{
		CategoryId:    breakdown.CategoryID,
		CategoryTitle: breakdown.CategoryTitle,
		Budget:        breakdown.Budget,
		Spent:         breakdown.Spent,
		Remaining:     breakdown.Remaining,
	}
}

// TransformPaymentMethodBreakdownToOAPI converts DTO to OpenAPI type
func TransformPaymentMethodBreakdownToOAPI(
	breakdown PaymentMethodBreakdown,
) oapi.PaymentMethodBreakdown {
	return oapi.PaymentMethodBreakdown{
		PaymentMethodId:    breakdown.PaymentMethodID,
		PaymentMethodTitle: breakdown.PaymentMethodTitle,
		TotalSpent:         breakdown.TotalSpent,
	}
}

// BatchTransformCategoryBreakdownToOAPI converts DTO slice to OpenAPI slice
func BatchTransformCategoryBreakdownToOAPI(
	breakdowns []CategoryBreakdown,
) []oapi.CategoryBreakdown {
	oapiBreakdowns := make([]oapi.CategoryBreakdown, len(breakdowns))
	for i, breakdown := range breakdowns {
		oapiBreakdowns[i] = TransformCategoryBreakdownToOAPI(breakdown)
	}
	return oapiBreakdowns
}

// BatchTransformPaymentMethodBreakdownToOAPI converts DTO slice to OpenAPI slice
func BatchTransformPaymentMethodBreakdownToOAPI(
	breakdowns []PaymentMethodBreakdown,
) []oapi.PaymentMethodBreakdown {
	oapiBreakdowns := make([]oapi.PaymentMethodBreakdown, len(breakdowns))
	for i, breakdown := range breakdowns {
		oapiBreakdowns[i] = TransformPaymentMethodBreakdownToOAPI(breakdown)
	}
	return oapiBreakdowns
}
