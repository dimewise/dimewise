package handler

import (
	"context"

	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/server/service"
	categorysvc "github.com/dimewise/dimewise/internal/server/service/category"
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
	res, err := categorysvc.CreateCategory(ctx, h.config, *req.Body)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				return oapi.PostCategory400JSONResponse{Code: string(se.Code), Success: false}, nil
			case service.ErrCodeUnauthorized:
				return oapi.PostCategory401JSONResponse{Code: string(se.Code), Success: false}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				fallthrough
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.PostCategory201JSONResponse(*res), nil
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
