package usersvc

import (
	"context"

	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/app/dto"
	"github.com/dimewise/dimewise/internal/app/mutation"
	"github.com/dimewise/dimewise/internal/app/repository"
	"github.com/dimewise/dimewise/internal/app/validate"
	"github.com/dimewise/dimewise/internal/server/middleware"
	"github.com/dimewise/dimewise/internal/server/service"
)

func UpdateUser(
	ctx context.Context,
	c *config.Config,
	form oapi.UserUpdate,
) (*oapi.User, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	err := validate.ValidUserUpdate(form)
	if err != nil {
		return nil, service.NewError(
			service.ErrCodeBadRequest,
			"form is invalid",
			err,
		)
	}

	updatedUser, err := mutation.UpdateUserByClerkID(ctx, c.DB(), user.ClerkID, form)
	if err != nil {
		var re *repository.Error
		if errors.As(err, &re) {
			switch re.Code {
			case repository.ErrCodeNotFound:
				return nil, service.NewError(service.ErrCodeNotFound, "user not found", err)
			default:
				return nil, err
			}
		}
		return nil, err
	}

	oapiUser := dto.TransformModelUserToOAPIUser(*updatedUser)

	return &oapiUser, nil
}
