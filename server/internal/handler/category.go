package handler

import (
	"context"
	"errors"
	"log"

	"github.com/sagikazarmark/slog-shim"
	"github.com/teoyi/dimewise/api/middleware"
	"github.com/teoyi/dimewise/internal/domain"
	lerrors "github.com/teoyi/dimewise/internal/util/errors"
	"github.com/teoyi/dimewise/oapi"
)

func (h *Handler) GetCategory(
	ctx context.Context,
	req oapi.GetCategoryRequestObject,
) (oapi.GetCategoryResponseObject, error) {
	auth := middleware.AuthFromContext(ctx)
	category, err := h.Repo.Category.GetCategoryByID(req.CategoryID)
	if err != nil {
		if errors.Is(err, lerrors.ErrResourceNotFound) {
			return oapi.GetCategory404Response{}, nil
		}

		slog.Error("error retrieving category", slog.Any("error", err))
		return nil, err
	}

	if category.AccountID != auth.ID {
		slog.Info(
			"unauthorized",
			slog.String("requestID", auth.ID.String()),
			slog.String("requested_ID", category.AccountID.String()),
		)
		return oapi.GetCategory403Response{}, nil
	}

	// TODO: calculate current amount for category using expense

	return oapi.GetCategory200JSONResponse{
		Budget:  int(category.Budget),
		Current: 0,
		Id:      category.ID.String(),
		Name:    category.Name,
	}, nil
}

func (h *Handler) GetCategories(
	ctx context.Context,
	_ oapi.GetCategoriesRequestObject,
) (oapi.GetCategoriesResponseObject, error) {
	auth := middleware.AuthFromContext(ctx)

	categories, err := h.Repo.Category.GetCategoryByAccountID(auth.ID)
	if err != nil {
		slog.Error("error retrieving categories", slog.Any("error", err))
		return nil, err
	}

	var dtos []oapi.BaseCategoryDto
	for _, category := range *categories {
		dto := oapi.BaseCategoryDto{
			Id:   category.ID.String(),
			Name: category.Name,
		}

		dtos = append(dtos, dto)
	}

	log.Println("test categories here")
	log.Println(dtos)

	return oapi.GetCategories200JSONResponse{
		Categories: &dtos,
	}, nil
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

func (h *Handler) PatchCategory(
	ctx context.Context,
	req oapi.PatchCategoryRequestObject,
) (oapi.PatchCategoryResponseObject, error) {
	auth := middleware.AuthFromContext(ctx)

	category, err := h.Repo.Category.GetCategoryByID(req.CategoryID)
	if err != nil {
		if errors.Is(err, lerrors.ErrResourceNotFound) {
			slog.Error("error retrieving category", slog.Any("error", err))
			return oapi.PatchCategory404Response{}, nil
		}

		return nil, err
	}

	if category.AccountID != auth.ID {
		slog.Info(
			"unauthorized",
			slog.String("requestID", auth.ID.String()),
			slog.String("requested_ID", category.AccountID.String()),
		)
		return oapi.PatchCategory403Response{}, nil
	}

	category = domain.UpdateCategoryNameAndBudget(category, req.Body.Name, req.Body.Budget)

	_, err = h.Repo.Category.UpdateCategoryByModel(category)
	if err != nil {
		return nil, err
	}

	return oapi.PatchCategory200Response{}, nil
}

func (h *Handler) DeleteCategory(
	ctx context.Context,
	req oapi.DeleteCategoryRequestObject,
) (oapi.DeleteCategoryResponseObject, error) {
	auth := middleware.AuthFromContext(ctx)

	category, err := h.Repo.Category.GetCategoryByID(req.CategoryID)
	if err != nil {
		if errors.Is(err, lerrors.ErrResourceNotFound) {
			slog.Error("error retrieving category", slog.Any("error", err))
			return oapi.DeleteCategory404Response{}, nil
		}

		return nil, err
	}

	if category.AccountID != auth.ID {
		slog.Info(
			"unauthorized",
			slog.String("requestID", auth.ID.String()),
			slog.String("requested_ID", category.AccountID.String()),
		)
		return oapi.DeleteCategory403Response{}, nil
	}

	_, err = h.Repo.Category.DeleteCategoryByID(category.ID)
	if err != nil {
		return nil, err
	}

	return oapi.DeleteCategory200Response{}, nil
}
