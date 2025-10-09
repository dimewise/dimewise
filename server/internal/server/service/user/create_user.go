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

func CreateUser(
	ctx context.Context,
	c *config.Config,
	form oapi.UserCreate,
) (*oapi.User, error) {
	clerkUser, ok := middleware.GetClerkUserFromContext(ctx)
	if !ok {
		return nil, service.NewError(
			service.ErrCodeUnauthorized,
			"authenticated user not found in context",
			errors.Errorf("authenticated user not found in context"),
		)
	}

	err := validate.ValidUserCreate(form)
	if err != nil {
		return nil, service.NewError(
			service.ErrCodeBadRequest,
			"form is invalid",
			err,
		)
	}

	newUser := dto.NewUser(clerkUser.ID, form)
	insertedUser, err := mutation.InsertUserByModel(ctx, c.DB(), newUser)
	if err != nil {
		return nil, err
	}

	oapiUser := dto.TransformModelUserToOAPIUser(*insertedUser)

	return &oapiUser, nil
}
