package categorysvc

import (
	"context"

	"github.com/go-errors/errors"
	"github.com/google/uuid"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/app/dto"
	"github.com/dimewise/dimewise/internal/app/mutation"
	"github.com/dimewise/dimewise/internal/app/repository"
	"github.com/dimewise/dimewise/internal/app/validate"
	"github.com/dimewise/dimewise/internal/server/middleware"
	"github.com/dimewise/dimewise/internal/server/service"
)

func UpdateCategoryByID(
	ctx context.Context,
	c *config.Config,
	categoryID uuid.UUID,
	form oapi.CategoryUpdate,
) (*oapi.Category, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	// Validate the update form
	err := validate.ValidCategoryUpdate(form)
	if err != nil {
		return nil, service.NewError(
			service.ErrCodeBadRequest,
			"form is invalid",
			err,
		)
	}

	// Grab target category
	category, err := repository.GetCategoryByID(ctx, c.DB(), user.ID, categoryID)
	if err != nil {
		var re *repository.Error
		if errors.As(err, &re) {
			switch re.Code {
			case repository.ErrCodeNotFound:
				return nil, service.NewError(service.ErrCodeNotFound, "category not found", err)
			default:
				return nil, err
			}
		}
	}

	// Update category with the form
	updatedCategory := dto.UpdateCategoryByForm(*category, form)

	// Update the category
	savedCategory, err := mutation.UpdateCategoryByModel(ctx, c.DB(), updatedCategory)
	if err != nil {
		return nil, err
	}

	// Transform to OpenAPI response
	oapiCategory := dto.TransformModelCategoryToOAPICategory(*savedCategory)

	return &oapiCategory, nil
}
