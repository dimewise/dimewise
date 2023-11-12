package handler

import (
	"context"

	"github.com/teoyi/dimewise/oapi"
)

func (h *Handler) GetCategories(
	_ context.Context,
	_ oapi.GetCategoriesRequestObject,
) (oapi.GetCategoriesResponseObject, error) {
	var categories []oapi.BaseCategoryDto
	return oapi.GetCategories200JSONResponse{Categories: &categories}, nil
}
