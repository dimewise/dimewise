package handler

import (
	"context"

	"github.com/dimewise/dimewise/generated/oapi"
)

func (h *Handler) GetExpenses(
	ctx context.Context,
	req oapi.GetExpensesRequestObject,
) (oapi.GetExpensesResponseObject, error) {
	return oapi.GetExpenses200JSONResponse{}, nil
}

func (h *Handler) PostExpense(
	ctx context.Context,
	req oapi.PostExpenseRequestObject,
) (oapi.PostExpenseResponseObject, error) {
	return oapi.PostExpense201JSONResponse{}, nil
}

func (h *Handler) DeleteExpensejById(
	ctx context.Context,
	req oapi.DeleteExpenseByIdRequestObject,
) (oapi.DeleteExpenseByIdResponseObject, error) {
	return oapi.DeleteExpenseById200JSONResponse{}, nil
}

func (h *Handler) GetExpenseById(
	ctx context.Context,
	req oapi.GetExpenseByIdRequestObject,
) (oapi.GetExpenseByIdResponseObject, error) {
	return oapi.GetExpenseById200JSONResponse{}, nil
}

func (h *Handler) PutExpenseById(
	ctx context.Context,
	req oapi.PutExpenseByIdRequestObject,
) (oapi.PutExpenseByIdResponseObject, error) {
	return oapi.PutExpenseById200JSONResponse{}, nil
}

func (h *Handler) PostVerifyExpenseById(
	ctx context.Context,
	req oapi.PostVerifyExpenseByIdRequestObject,
) (oapi.PostVerifyExpenseByIdResponseObject, error) {
	return oapi.PostVerifyExpenseById200JSONResponse{}, nil
}
