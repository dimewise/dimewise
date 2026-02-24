package handler

import (
	"context"

	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/server/service"
	expensesvc "github.com/dimewise/dimewise/internal/server/service/expense"
)

func (h *Handler) GetExpenses(
	ctx context.Context,
	req oapi.GetExpensesRequestObject,
) (oapi.GetExpensesResponseObject, error) {
	res, pagination, err := expensesvc.GetExpenses(ctx, h.config, req.Params)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.GetExpenses401JSONResponse{Code: string(se.Code), Success: false}, nil
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

	return oapi.GetExpenses200JSONResponse{Data: *res, Pagination: *pagination}, nil
}

func (h *Handler) PostExpense(
	ctx context.Context,
	req oapi.PostExpenseRequestObject,
) (oapi.PostExpenseResponseObject, error) {
	res, err := expensesvc.CreateExpense(ctx, h.config, *req.Body)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				return oapi.PostExpense400JSONResponse{Code: string(se.Code), Success: false}, nil
			case service.ErrCodeUnauthorized:
				return oapi.PostExpense401JSONResponse{Code: string(se.Code), Success: false}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				return oapi.PostExpense404JSONResponse{Code: string(se.Code), Success: false}, nil
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.PostExpense201JSONResponse(*res), nil
}

func (h *Handler) DeleteExpenseById( //nolint:revive // generated name from oapi spec
	ctx context.Context,
	req oapi.DeleteExpenseByIdRequestObject,
) (oapi.DeleteExpenseByIdResponseObject, error) {
	err := expensesvc.DeleteExpense(ctx, h.config, req.ExpenseId)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.DeleteExpenseById401JSONResponse{
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
	return oapi.DeleteExpenseById200JSONResponse{Success: true}, nil
}

func (h *Handler) GetExpenseById(
	ctx context.Context,
	req oapi.GetExpenseByIdRequestObject,
) (oapi.GetExpenseByIdResponseObject, error) {
	res, err := expensesvc.GetExpenseByID(ctx, h.config, req.ExpenseId)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.GetExpenseById401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				return oapi.GetExpenseById404JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.GetExpenseById200JSONResponse(*res), nil
}

func (h *Handler) PutExpenseById(
	ctx context.Context,
	req oapi.PutExpenseByIdRequestObject,
) (oapi.PutExpenseByIdResponseObject, error) {
	res, err := expensesvc.UpdateExpense(ctx, h.config, req.ExpenseId, *req.Body)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				return oapi.PutExpenseById400JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeUnauthorized:
				return oapi.PutExpenseById401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				return oapi.PutExpenseById404JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.PutExpenseById200JSONResponse(*res), nil
}

func (h *Handler) PostVerifyExpenseById(
	ctx context.Context,
	req oapi.PostVerifyExpenseByIdRequestObject,
) (oapi.PostVerifyExpenseByIdResponseObject, error) {
	res, err := expensesvc.VerifyExpense(ctx, h.config, req.ExpenseId)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.PostVerifyExpenseById401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				return oapi.PostVerifyExpenseById404JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.PostVerifyExpenseById200JSONResponse(*res), nil
}
