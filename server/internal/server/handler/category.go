package handler

import (
	"context"

	"github.com/dimewise/dimewise/generated/oapi"
)

func (h *Handler) GetCategories(
	ctx context.Context,
	req oapi.GetCategoriesRequestObject,
) (oapi.GetCategoriesResponseObject, error) {
	return oapi.GetCategories200JSONResponse{}, nil
}

func (h *Handler) PostCategory(
	ctx context.Context,
	req oapi.PostCategoryRequestObject,
) (oapi.PostCategoryResponseObject, error) {
	return oapi.PostCategory201JSONResponse{}, nil
}

func (h *Handler) DeleteCategoryById(
	ctx context.Context,
	req oapi.DeleteCategoryByIdRequestObject,
) (oapi.DeleteCategoryByIdResponseObject, error) {
	return oapi.DeleteCategoryById200JSONResponse{}, nil
}

func (h *Handler) GetCategoryById(
	ctx context.Context,
	req oapi.GetCategoryByIdRequestObject,
) (oapi.GetCategoryByIdResponseObject, error) {
	return oapi.GetCategoryById200JSONResponse{}, nil
}

func (h *Handler) PutCategoryById(
	ctx context.Context,
	req oapi.PutCategoryByIdRequestObject,
) (oapi.PutCategoryByIdResponseObject, error) {
	return oapi.PutCategoryById200JSONResponse{}, nil
}
