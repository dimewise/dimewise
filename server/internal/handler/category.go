package handler

import (
	"context"

	"github.com/teoyi/dimewise/api/middleware"
	"github.com/teoyi/dimewise/internal/domain"
	"github.com/teoyi/dimewise/oapi"
)

func (h *Handler) GetCategories(
	_ context.Context,
	_ oapi.GetCategoriesRequestObject,
) (oapi.GetCategoriesResponseObject, error) {
	var categories []oapi.BaseCategoryDto
	return oapi.GetCategories200JSONResponse{Categories: &categories}, nil
}

func (h *Handler) PostCategory(
	ctx context.Context,
	req oapi.PostCategoryRequestObject,
) (oapi.PostCategoryResponseObject, error) {
	auth := middleware.AuthFromContext(ctx)
	newCategory := domain.CreateCategory(auth.ID, req.Body.Name, req.Body.Budget)

	_, err := h.Repo.Category.CreateCategoryByModel(newCategory)
	if err != nil {
		return nil, err
	}

	return oapi.PostCategory201Response{}, nil
}
