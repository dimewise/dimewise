package handler

import (
	"context"
	"errors"
	"log"
	"log/slog"

	"github.com/teoyi/dimewise/api/middleware"
	"github.com/teoyi/dimewise/internal/domain"
	lerrors "github.com/teoyi/dimewise/internal/util/errors"
	"github.com/teoyi/dimewise/oapi"
)

func (h *Handler) GetExpense(
	ctx context.Context,
	req oapi.GetExpenseRequestObject,
) (oapi.GetExpenseResponseObject, error) {
	auth := middleware.AuthFromContext(ctx)
	expense, err := h.Repo.Expense.GetExpenseByID(req.ExpenseID)
	if err != nil {
		if errors.Is(err, lerrors.ErrResourceNotFound) {
			return oapi.GetExpense404Response{}, nil
		}

		slog.Error("error retrieving expense", slog.Any("error", err))
		return nil, err
	}

	if expense.AccountID != auth.ID {
		slog.Info(
			"unauthorized",
			slog.String("requestID", auth.ID.String()),
			slog.String("requested_ID", expense.AccountID.String()),
		)
		return oapi.GetExpense403Response{}, nil
	}

	return oapi.GetExpense200JSONResponse{
		Amount:      int(expense.Amount),
		CategoryId:  expense.CategoryID,
		Description: expense.Description,
		Id:          expense.ID,
		Title:       expense.Title,
	}, nil
}

func (h *Handler) GetExpenses(
	ctx context.Context,
	req oapi.GetExpensesRequestObject,
) (oapi.GetExpensesResponseObject, error) {
	auth := middleware.AuthFromContext(ctx)

	var dtos []oapi.FullExpenseDto
	if req.Params.Start == nil || req.Params.End == nil {
		// case: no time span, only latest
		expenses, err := h.Repo.Expense.GetExpenseByAccountID(auth.ID)
		if err != nil {
			slog.Error("error retrieving expenses", slog.Any("error", err))
			return nil, err
		}

		for _, expense := range *expenses {
			dto := oapi.FullExpenseDto{
				Amount:      int(expense.Amount),
				CategoryId:  expense.CategoryID,
				Description: expense.Description,
				Id:          expense.ID,
				Title:       expense.Title,
			}

			dtos = append(dtos, dto)
		}
	}

	// TODO: add logic for with time span

	return oapi.GetExpenses200JSONResponse{
		Expenses: &dtos,
	}, nil
}

func (h *Handler) PostExpense(
	ctx context.Context,
	req oapi.PostExpenseRequestObject,
) (oapi.PostExpenseResponseObject, error) {
	auth := middleware.AuthFromContext(ctx)
	newExpense := domain.CreateExpense(
		auth.ID,
		req.Body.CategoryId,
		req.Body.Title,
		req.Body.Description,
		req.Body.Amount,
	)

	_, err := h.Repo.Expense.CreateExpenseByModel(newExpense)
	if err != nil {
		return nil, err
	}

	return oapi.PostExpense201Response{}, nil
}

func (h *Handler) PatchExpense(
	ctx context.Context,
	req oapi.PatchExpenseRequestObject,
) (oapi.PatchExpenseResponseObject, error) {
	auth := middleware.AuthFromContext(ctx)

	expense, err := h.Repo.Expense.DeleteExpenseByID(req.ExpenseID)
	if err != nil {
		if errors.Is(err, lerrors.ErrResourceNotFound) {
			return oapi.PatchExpense404Response{}, nil
		}

		slog.Error("error retrieving expense", slog.Any("error", err))
	}

	if expense.AccountID != auth.ID {
		slog.Info(
			"unauthorized",
			slog.String("requestID", auth.ID.String()),
			slog.String("requested_ID", expense.AccountID.String()),
		)
		return oapi.PatchExpense403Response{}, nil
	}

	expense = domain.UpdateExpense(
		expense,
		req.Body.CategoryId,
		req.Body.Title,
		req.Body.Description,
		req.Body.Amount,
	)

	_, err = h.Repo.Expense.UpdateExpenseByModel(expense)
	if err != nil {
		return nil, err
	}

	return oapi.PatchExpense200Response{}, nil
}

func (h *Handler) DeleteExpense(
	ctx context.Context,
	req oapi.DeleteExpenseRequestObject,
) (oapi.DeleteExpenseResponseObject, error) {
	auth := middleware.AuthFromContext(ctx)

	expense, err := h.Repo.Expense.DeleteExpenseByID(req.ExpenseID)
	if err != nil {
		if errors.Is(err, lerrors.ErrResourceNotFound) {
			return oapi.DeleteExpense404Response{}, nil
		}

		slog.Error("error retrieving expense", slog.Any("error", err))
	}

	if expense.AccountID != auth.ID {
		slog.Info(
			"unauthorized",
			slog.String("requestID", auth.ID.String()),
			slog.String("requested_ID", expense.AccountID.String()),
		)
		return oapi.DeleteExpense403Response{}, nil
	}

	_, err = h.Repo.Expense.DeleteExpenseByID(req.ExpenseID)
	if err != nil {
		return nil, err
	}

	return oapi.DeleteExpense200Response{}, nil
}

func (h *Handler) GetExpensesOverview(
	ctx context.Context,
	_ oapi.GetExpensesOverviewRequestObject,
) (oapi.GetExpensesOverviewResponseObject, error) {
	auth := middleware.AuthFromContext(ctx)

	overview, err := h.Repo.Expense.GetMonthlyOverview(auth.ID)
	if err != nil {
		return nil, err
	}

	log.Println(overview)
	return nil, nil
}
