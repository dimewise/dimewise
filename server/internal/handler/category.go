package handler

import (
	"context"
	"github.com/teoyi/dimewise/oapi"
)

func (h *Handler) GetCategories(
	ctx context.Context,
	request oapi.GetCategoriesRequestObject,
) (oapi.GetCategoriesResponseObject, error) {
	return oapi.GetCategories200JSONResponse{}, nil
}
