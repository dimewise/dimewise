package handler

import (
	"context"

	"github.com/teoyi/dimewise/oapi"
)

func (h *Handler) GetExpense(
	ctx context.Context,
	req oapi.GetExpenseRequestObject,
) (oapi.GetExpenseResponseObject, error) {
	return oapi.GetExpense200JSONResponse{}, nil
}

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
	return oapi.PostExpense201Response{}, nil
}

func (h *Handler) PatchExpense(
	ctx context.Context,
	req oapi.PatchExpenseRequestObject,
) (oapi.PatchExpenseResponseObject, error) {
	return oapi.PatchExpense200Response{}, nil
}

func (h *Handler) DeleteExpense(
	ctx context.Context,
	req oapi.DeleteExpenseRequestObject,
) (oapi.DeleteExpenseResponseObject, error) {
	return oapi.DeleteExpense200Response{}, nil
}

func (h *Handler) GetExpensesOverview(
	ctx context.Context,
	req oapi.GetExpensesOverviewRequestObject,
) (oapi.GetExpensesOverviewResponseObject, error) {
	return oapi.GetExpensesOverview200JSONResponse{}, nil
}
