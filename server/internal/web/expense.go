package web

import (
	"context"
	"errors"
	"net/http"
	"time"

	"dimewise/generated/oapi"
	"dimewise/internal/middleware"
	"dimewise/internal/repository"
	"dimewise/internal/service"
)

// ListExpenses handles GET /expenses.
func (h *Handler) ListExpenses(
	ctx context.Context,
	request oapi.ListExpensesRequestObject,
) (oapi.ListExpensesResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.ListExpenses401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	filter := repository.ExpenseFilter{}

	if request.Params.CategoryId != nil {
		id := *request.Params.CategoryId
		filter.CategoryID = &id
	}

	if request.Params.PaidBy != nil {
		id := *request.Params.PaidBy
		filter.PaidBy = &id
	}

	if request.Params.From != nil {
		t := request.Params.From.Time
		filter.From = &t
	}

	if request.Params.To != nil {
		t := request.Params.To.Time
		// Set to end of day
		t = t.Add(24*time.Hour - time.Nanosecond)
		filter.To = &t
	}

	if request.Params.Limit != nil {
		filter.Limit = *request.Params.Limit
	}

	if request.Params.Offset != nil {
		filter.Offset = *request.Params.Offset
	}

	expenses, total, err := h.expenseService.List(ctx, user.ID, filter)
	if err != nil {
		return mapExpenseListError(err)
	}

	apiExpenses := make([]oapi.ExpenseWithSplits, 0, len(expenses))
	for i := range expenses {
		apiExpenses = append(apiExpenses, expenseWithSplitsToAPI(&expenses[i]))
	}

	return oapi.ListExpenses200JSONResponse(oapi.ExpenseListResponse{
		Expenses: apiExpenses,
		Total:    total,
	}), nil
}

// CreateExpense handles POST /expenses.
func (h *Handler) CreateExpense(
	ctx context.Context,
	request oapi.CreateExpenseRequestObject,
) (oapi.CreateExpenseResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.CreateExpense401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	splitInputs := make([]service.SplitInput, len(request.Body.Splits))
	for i, s := range request.Body.Splits {
		splitInputs[i] = service.SplitInput{
			UserID: s.UserId,
			Amount: s.Amount,
		}
	}

	created, err := h.expenseService.Create(
		ctx,
		user.ID,
		request.Body.PaidBy,
		request.Body.BudgetCategoryId,
		request.Body.Title,
		request.Body.Amount,
		request.Body.Notes,
		request.Body.IncurredAt,
		splitInputs,
	)
	if err != nil {
		return mapExpenseCreateError(err)
	}

	return oapi.CreateExpense201JSONResponse(expenseWithSplitsToAPI(created)), nil
}

// GetExpense handles GET /expenses/{expenseId}.
func (h *Handler) GetExpense(
	ctx context.Context,
	request oapi.GetExpenseRequestObject,
) (oapi.GetExpenseResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.GetExpense401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	expense, err := h.expenseService.GetByID(ctx, user.ID, request.ExpenseId)
	if err != nil {
		return mapExpenseGetError(err)
	}

	return oapi.GetExpense200JSONResponse(expenseWithSplitsToAPI(expense)), nil
}

// UpdateExpense handles PATCH /expenses/{expenseId}.
func (h *Handler) UpdateExpense(
	ctx context.Context,
	request oapi.UpdateExpenseRequestObject,
) (oapi.UpdateExpenseResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.UpdateExpense401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	var splitInputs []service.SplitInput
	if request.Body.Splits != nil {
		splitInputs = make([]service.SplitInput, len(*request.Body.Splits))
		for i, s := range *request.Body.Splits {
			splitInputs[i] = service.SplitInput{
				UserID: s.UserId,
				Amount: s.Amount,
			}
		}
	}

	updated, err := h.expenseService.Update(
		ctx,
		user.ID,
		request.ExpenseId,
		request.Body.PaidBy,
		request.Body.BudgetCategoryId,
		request.Body.Title,
		request.Body.Amount,
		request.Body.Notes,
		request.Body.IncurredAt,
		splitInputs,
	)
	if err != nil {
		return mapExpenseUpdateError(err)
	}

	return oapi.UpdateExpense200JSONResponse(expenseWithSplitsToAPI(updated)), nil
}

// DeleteExpense handles DELETE /expenses/{expenseId}.
func (h *Handler) DeleteExpense(
	ctx context.Context,
	request oapi.DeleteExpenseRequestObject,
) (oapi.DeleteExpenseResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.DeleteExpense401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	err := h.expenseService.Delete(ctx, user.ID, request.ExpenseId)
	if err != nil {
		return mapExpenseDeleteError(err)
	}

	return oapi.DeleteExpense204Response{}, nil
}

// --- Type mappers ---

func expenseWithSplitsToAPI(e *repository.ExpenseWithSplits) oapi.ExpenseWithSplits {
	splits := make([]oapi.ExpenseSplit, 0, len(e.Splits))
	for _, s := range e.Splits {
		splits = append(splits, oapi.ExpenseSplit{
			Id:        s.ID,
			ExpenseId: s.ExpenseID,
			UserId:    s.UserID,
			Amount:    s.Amount,
		})
	}

	return oapi.ExpenseWithSplits{
		Id:               e.ID,
		CreatedAt:        e.CreatedAt,
		UpdatedAt:        e.UpdatedAt,
		HouseholdId:      e.HouseholdID,
		BudgetCategoryId: e.BudgetCategoryID,
		PaidBy:           e.PaidBy,
		LoggedBy:         e.LoggedBy,
		Title:            e.Title,
		Amount:           e.Amount,
		Notes:            e.Notes,
		IncurredAt:       e.IncurredAt,
		Splits:           splits,
	}
}

// --- Error mappers ---

func mapExpenseListError(
	err error,
) (oapi.ListExpensesResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrNotFound:
		return oapi.ListExpenses404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapExpenseCreateError(
	err error,
) (oapi.CreateExpenseResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrBadRequest:
		return oapi.CreateExpense400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: oapi.BadRequestApplicationProblemPlusJSONResponse(
				newProblem(http.StatusBadRequest, "Bad Request", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.CreateExpense404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapExpenseGetError(
	err error,
) (oapi.GetExpenseResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	// Intentionally maps Forbidden to 404 to avoid leaking resource existence.
	case service.ErrForbidden:
		return oapi.GetExpense404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", "expense not found"),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.GetExpense404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapExpenseUpdateError(
	err error,
) (oapi.UpdateExpenseResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrBadRequest:
		return oapi.UpdateExpense400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: oapi.BadRequestApplicationProblemPlusJSONResponse(
				newProblem(http.StatusBadRequest, "Bad Request", svcErr.Message),
			),
		}, nil
	case service.ErrForbidden:
		return oapi.UpdateExpense403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(http.StatusForbidden, "Forbidden", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.UpdateExpense404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapExpenseDeleteError(
	err error,
) (oapi.DeleteExpenseResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrForbidden:
		return oapi.DeleteExpense403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(http.StatusForbidden, "Forbidden", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.DeleteExpense404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}
