package usersvc

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

	updatedUser := dto.UpdateUserByUpdateForm(*user, form)
	savedUser, err := mutation.UpdateUserByModel(ctx, c.DB(), updatedUser)
	if err != nil {
		return nil, err
	}

	oapiUser := dto.TransformModelUserToOAPIUser(*savedUser)

	return &oapiUser, nil
}
