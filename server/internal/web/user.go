package web

import (
	"context"

	"dimewise/generated/oapi"
	"dimewise/internal/middleware"

	openapi_types "github.com/oapi-codegen/runtime/types"
)

func (h *Handler) GetUsersMe(
	ctx context.Context,
	_ oapi.GetUsersMeRequestObject,
) (oapi.GetUsersMeResponseObject, error) {
	user, ok := middleware.GetAppUserFromContext(ctx)
	if !ok {
		return oapi.GetUsersMe401ApplicationProblemPlusJSONResponse{
			UnauthorizedApplicationProblemPlusJSONResponse: oapi.UnauthorizedApplicationProblemPlusJSONResponse(
				newProblem(401, "Unauthorized", "user not found in context"),
			),
		}, nil
	}

	return oapi.GetUsersMe200JSONResponse(oapi.User{
		Id:        user.ID,
		Email:     openapi_types.Email(user.Email),
		FirstName: user.FirstName,
		LastName:  user.LastName,
		AvatarUrl: user.AvatarURL,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}), nil
}
