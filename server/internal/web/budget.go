package web

import (
	"context"
	"errors"
	"net/http"

	"github.com/google/uuid"

	"dimewise/generated/dimewise/public/model"
	"dimewise/generated/oapi"
	"dimewise/internal/middleware"
	"dimewise/internal/service"
)

// ListBudgetCategories handles GET /budgets.
func (h *Handler) ListBudgetCategories(
	ctx context.Context,
	_ oapi.ListBudgetCategoriesRequestObject,
) (oapi.ListBudgetCategoriesResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.ListBudgetCategories401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	categories, err := h.budgetService.List(ctx, user.ID)
	if err != nil {
		return mapBudgetListError(err)
	}

	result := make(oapi.ListBudgetCategories200JSONResponse, 0, len(categories))
	for i := range categories {
		result = append(result, budgetCategoryToAPI(&categories[i]))
	}

	return result, nil
}

// CreateBudgetCategory handles POST /budgets.
func (h *Handler) CreateBudgetCategory(
	ctx context.Context,
	request oapi.CreateBudgetCategoryRequestObject,
) (oapi.CreateBudgetCategoryResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.CreateBudgetCategory401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	created, err := h.budgetService.Create(
		ctx,
		user.ID,
		request.Body.Name,
		request.Body.Amount,
	)
	if err != nil {
		return mapBudgetCreateError(err)
	}

	return oapi.CreateBudgetCategory201JSONResponse(budgetCategoryToAPI(created)), nil
}

// UpdateBudgetCategory handles PATCH /budgets/{budgetId}.
func (h *Handler) UpdateBudgetCategory(
	ctx context.Context,
	request oapi.UpdateBudgetCategoryRequestObject,
) (oapi.UpdateBudgetCategoryResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.UpdateBudgetCategory401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	var sortOrder *int
	if request.Body.SortOrder != nil {
		v := *request.Body.SortOrder
		sortOrder = &v
	}

	updated, err := h.budgetService.Update(
		ctx,
		user.ID,
		request.BudgetId,
		request.Body.Name,
		request.Body.Amount,
		sortOrder,
	)
	if err != nil {
		return mapBudgetUpdateError(err)
	}

	return oapi.UpdateBudgetCategory200JSONResponse(budgetCategoryToAPI(updated)), nil
}

// DeleteBudgetCategory handles DELETE /budgets/{budgetId}.
func (h *Handler) DeleteBudgetCategory(
	ctx context.Context,
	request oapi.DeleteBudgetCategoryRequestObject,
) (oapi.DeleteBudgetCategoryResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.DeleteBudgetCategory401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	err := h.budgetService.Delete(ctx, user.ID, request.BudgetId)
	if err != nil {
		return mapBudgetDeleteError(err)
	}

	return oapi.DeleteBudgetCategory204Response{}, nil
}

// GetBudgetOverview handles GET /budgets/overview.
func (h *Handler) GetBudgetOverview(
	ctx context.Context,
	_ oapi.GetBudgetOverviewRequestObject,
) (oapi.GetBudgetOverviewResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.GetBudgetOverview401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	totalBudget, totalSpent, spending, categories, err := h.budgetService.GetOverview(ctx, user.ID)
	if err != nil {
		return mapBudgetOverviewError(err)
	}

	// Build spending map for quick lookup
	spendingMap := make(map[uuid.UUID]int64, len(spending))
	for _, sp := range spending {
		spendingMap[sp.BudgetCategoryID] = sp.Spent
	}

	categoryOverviews := make([]oapi.BudgetCategoryOverview, 0, len(categories))
	for _, c := range categories {
		spent := spendingMap[c.ID]
		categoryOverviews = append(categoryOverviews, oapi.BudgetCategoryOverview{
			Id:        c.ID,
			Name:      c.Name,
			Budget:    c.Amount,
			Spent:     spent,
			Remaining: c.Amount - spent,
		})
	}

	remaining := totalBudget - totalSpent

	return oapi.GetBudgetOverview200JSONResponse(oapi.BudgetOverview{
		TotalBudget: totalBudget,
		TotalSpent:  totalSpent,
		Remaining:   remaining,
		Categories:  categoryOverviews,
	}), nil
}

// --- Type mappers ---

func budgetCategoryToAPI(c *model.BudgetCategories) oapi.BudgetCategory {
	return oapi.BudgetCategory{
		Id:          c.ID,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
		HouseholdId: c.HouseholdID,
		Name:        c.Name,
		Amount:      c.Amount,
		SortOrder:   int(c.SortOrder),
	}
}

// --- Error mappers ---

func mapBudgetListError(
	err error,
) (oapi.ListBudgetCategoriesResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrNotFound:
		return oapi.ListBudgetCategories404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapBudgetCreateError(
	err error,
) (oapi.CreateBudgetCategoryResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrBadRequest:
		return oapi.CreateBudgetCategory400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: oapi.BadRequestApplicationProblemPlusJSONResponse(
				newProblem(http.StatusBadRequest, "Bad Request", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.CreateBudgetCategory404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapBudgetUpdateError(
	err error,
) (oapi.UpdateBudgetCategoryResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrBadRequest:
		return oapi.UpdateBudgetCategory400ApplicationProblemPlusJSONResponse{
			BadRequestApplicationProblemPlusJSONResponse: oapi.BadRequestApplicationProblemPlusJSONResponse(
				newProblem(http.StatusBadRequest, "Bad Request", svcErr.Message),
			),
		}, nil
	case service.ErrForbidden:
		return oapi.UpdateBudgetCategory403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(http.StatusForbidden, "Forbidden", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.UpdateBudgetCategory404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapBudgetDeleteError(
	err error,
) (oapi.DeleteBudgetCategoryResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrForbidden:
		return oapi.DeleteBudgetCategory403ApplicationProblemPlusJSONResponse{
			ForbiddenApplicationProblemPlusJSONResponse: oapi.ForbiddenApplicationProblemPlusJSONResponse(
				newProblem(http.StatusForbidden, "Forbidden", svcErr.Message),
			),
		}, nil
	case service.ErrNotFound:
		return oapi.DeleteBudgetCategory404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}

func mapBudgetOverviewError(
	err error,
) (oapi.GetBudgetOverviewResponseObject, error) {
	var svcErr *service.Error
	if !errors.As(err, &svcErr) {
		return nil, err
	}

	switch svcErr.Code {
	case service.ErrNotFound:
		return oapi.GetBudgetOverview404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: oapi.NotFoundApplicationProblemPlusJSONResponse(
				newProblem(http.StatusNotFound, "Not Found", svcErr.Message),
			),
		}, nil
	default:
		return nil, err
	}
}
