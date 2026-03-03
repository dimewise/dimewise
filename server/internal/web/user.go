package web

import (
	"context"
	"errors"
	"net/http"

	openapi_types "github.com/oapi-codegen/runtime/types"

	"dimewise/generated/dimewise/public/model"
	"dimewise/generated/oapi"
	"dimewise/internal/middleware"
	"dimewise/internal/service"
)

func toUserResponse(user *model.Users) oapi.User {
	return oapi.User{
		Id:        user.ID,
		Email:     openapi_types.Email(user.Email),
		FirstName: user.FirstName,
		LastName:  user.LastName,
		AvatarUrl: user.AvatarURL,
		Language:  user.Language,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}

func (h *Handler) GetUsersMe(
	ctx context.Context,
	_ oapi.GetUsersMeRequestObject,
) (oapi.GetUsersMeResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.GetUsersMe401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	return oapi.GetUsersMe200JSONResponse(toUserResponse(user)), nil
}

func (h *Handler) PatchUsersMe(
	ctx context.Context,
	request oapi.PatchUsersMeRequestObject,
) (oapi.PatchUsersMeResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.PatchUsersMe401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(http.StatusUnauthorized, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	if request.Body.Language != nil {
		updated, err := h.userService.UpdateLanguage(ctx, user.ID, string(*request.Body.Language))
		if err != nil {
			var svcErr *service.Error
			if errors.As(err, &svcErr) && svcErr.Code == service.ErrBadRequest {
				return oapi.PatchUsersMe400ApplicationProblemPlusJSONResponse{
					BadRequestApplicationProblemPlusJSONResponse: oapi.BadRequestApplicationProblemPlusJSONResponse(
						newProblem(http.StatusBadRequest, "Bad Request", svcErr.Message),
					),
				}, nil
			}
			return nil, err
		}

		return oapi.PatchUsersMe200JSONResponse(toUserResponse(updated)), nil
	}

	// No fields to update — return current user
	return oapi.PatchUsersMe200JSONResponse(toUserResponse(user)), nil
}
