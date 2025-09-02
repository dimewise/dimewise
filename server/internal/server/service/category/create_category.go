package categorysvc

import (
	"context"

	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/app/dto"
	"github.com/dimewise/dimewise/internal/app/mutation"
	"github.com/dimewise/dimewise/internal/app/validate"
	"github.com/dimewise/dimewise/internal/server/middleware"
	"github.com/dimewise/dimewise/internal/server/service"
)

func CreateCategory(
	ctx context.Context,
	c *config.Config,
	form oapi.CategoryCreate,
) (*oapi.Category, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	err := validate.ValidCategoryCreate(form)
	if err != nil {
		return nil, service.NewError(
			service.ErrCodeBadRequest,
			"form is invalid",
			err,
		)
	}

	newCategory := dto.NewCategory(user.ID, form)
	insertedCategory, err := mutation.InsertCategoryByModel(ctx, c.DB(), newCategory)
	if err != nil {
		return nil, err
	}

	oapiCategory := dto.TransformModelCategoryToOAPICategory(*insertedCategory)

	return &oapiCategory, nil
}
