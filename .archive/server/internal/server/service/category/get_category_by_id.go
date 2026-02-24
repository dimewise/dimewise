package categorysvc

import (
	"context"

	"github.com/go-errors/errors"
	"github.com/google/uuid"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/app/dto"
	"github.com/dimewise/dimewise/internal/app/repository"
	"github.com/dimewise/dimewise/internal/server/middleware"
	"github.com/dimewise/dimewise/internal/server/service"
)

func GetCategoryByID(
	ctx context.Context,
	c *config.Config,
	targetCategoryID uuid.UUID,
) (*oapi.Category, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	category, err := repository.GetCategoryByID(ctx, c.DB(), user.ID, targetCategoryID)
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
		return nil, err
	}

	oapiCategory := dto.TransformModelCategoryToOAPICategory(*category)

	return &oapiCategory, nil
}
