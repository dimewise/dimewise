package handler

import (
	"context"

	"github.com/teoyi/dimewise/oapi"
)

func (h *Handler) GetExpense(
	_ context.Context,
	_ oapi.GetExpenseRequestObject,
) (oapi.GetExpenseResponseObject, error) {
	return nil, nil
}

func (h *Handler) GetExpenses(
	_ context.Context,
	_ oapi.GetExpensesRequestObject,
) (oapi.GetExpensesResponseObject, error) {
	return nil, nil
}

func (h *Handler) PostExpense(
	_ context.Context,
	_ oapi.PostExpenseRequestObject,
) (oapi.PostExpenseResponseObject, error) {
	return oapi.PostExpense201Response{}, nil
}

func (h *Handler) PatchExpense(
	_ context.Context,
	_ oapi.PatchExpenseRequestObject,
) (oapi.PatchExpenseResponseObject, error) {
	return oapi.PatchExpense200Response{}, nil
}

func (h *Handler) DeleteExpense(
	_ context.Context,
	_ oapi.DeleteExpenseRequestObject,
) (oapi.DeleteExpenseResponseObject, error) {
	return oapi.DeleteExpense200Response{}, nil
}

func (h *Handler) GetExpensesOverview(
	_ context.Context,
	_ oapi.GetExpensesOverviewRequestObject,
) (oapi.GetExpensesOverviewResponseObject, error) {
	return nil, nil
}
