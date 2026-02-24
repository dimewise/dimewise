package handler

import (
	"context"

	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/server/service"
	analyticsvc "github.com/dimewise/dimewise/internal/server/service/analytics"
)

func (h *Handler) GetAnalyticsBudgetOverview(
	ctx context.Context,
	req oapi.GetAnalyticsBudgetOverviewRequestObject,
) (oapi.GetAnalyticsBudgetOverviewResponseObject, error) {
	res, err := analyticsvc.GetBudgetOverview(ctx, h.config, req.Params)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.GetAnalyticsBudgetOverview401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				fallthrough
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.GetAnalyticsBudgetOverview200JSONResponse(*res), nil
}

func (h *Handler) GetAnalyticsCategoriesBreakdown(
	ctx context.Context,
	req oapi.GetAnalyticsCategoriesBreakdownRequestObject,
) (oapi.GetAnalyticsCategoriesBreakdownResponseObject, error) {
	res, err := analyticsvc.GetCategoriesBreakdown(ctx, h.config, req.Params)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.GetAnalyticsCategoriesBreakdown401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				fallthrough
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.GetAnalyticsCategoriesBreakdown200JSONResponse(*res), nil
}

func (h *Handler) GetAnalyticsPaymentMethodsBreakdown(
	ctx context.Context,
	req oapi.GetAnalyticsPaymentMethodsBreakdownRequestObject,
) (oapi.GetAnalyticsPaymentMethodsBreakdownResponseObject, error) {
	res, err := analyticsvc.GetPaymentMethodsBreakdown(ctx, h.config, req.Params)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.GetAnalyticsPaymentMethodsBreakdown401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				fallthrough
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.GetAnalyticsPaymentMethodsBreakdown200JSONResponse(*res), nil
}

func (h *Handler) GetAnalyticsRecentTransactions(
	ctx context.Context,
	req oapi.GetAnalyticsRecentTransactionsRequestObject,
) (oapi.GetAnalyticsRecentTransactionsResponseObject, error) {
	res, err := analyticsvc.GetRecentTransactions(ctx, h.config, req.Params)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.GetAnalyticsRecentTransactions401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				fallthrough
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.GetAnalyticsRecentTransactions200JSONResponse(*res), nil
}
