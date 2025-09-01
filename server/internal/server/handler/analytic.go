package handler

import (
	"context"

	"github.com/dimewise/dimewise/generated/oapi"
)

func (h *Handler) GetAnalyticsBudgetOverview(
	ctx context.Context,
	req oapi.GetAnalyticsBudgetOverviewRequestObject,
) (oapi.GetAnalyticsBudgetOverviewResponseObject, error) {
	return oapi.GetAnalyticsBudgetOverview200JSONResponse{}, nil
}

func (h *Handler) GetAnalyticsCategoriesBreakdown(
	ctx context.Context,
	req oapi.GetAnalyticsCategoriesBreakdownRequestObject,
) (oapi.GetAnalyticsCategoriesBreakdownResponseObject, error) {
	return oapi.GetAnalyticsCategoriesBreakdown200JSONResponse{}, nil
}

func (h *Handler) GetAnalyticsPaymentMethodsBreakdown(
	ctx context.Context,
	req oapi.GetAnalyticsPaymentMethodsBreakdownRequestObject,
) (oapi.GetAnalyticsPaymentMethodsBreakdownResponseObject, error) {
	return oapi.GetAnalyticsPaymentMethodsBreakdown200JSONResponse{}, nil
}

func (h *Handler) GetAnalyticsRecentTransactions(
	ctx context.Context,
	req oapi.GetAnalyticsRecentTransactionsRequestObject,
) (oapi.GetAnalyticsRecentTransactionsResponseObject, error) {
	return oapi.GetAnalyticsRecentTransactions200JSONResponse{}, nil
}
