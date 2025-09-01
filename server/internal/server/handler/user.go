package handler

import (
	"context"

	"github.com/dimewise/dimewise/generated/oapi"
)

func (h *Handler) PostMeUser(
	ctx context.Context,
	req oapi.PostMeUserRequestObject,
) (oapi.PostMeUserResponseObject, error) {
	return oapi.PostMeUser201JSONResponse{}, nil
}

func (h *Handler) GetMeUser(
	ctx context.Context,
	req oapi.GetMeUserRequestObject,
) (oapi.GetMeUserResponseObject, error) {
	return oapi.GetMeUser200JSONResponse{}, nil
}

func (h *Handler) PutMeUser(
	ctx context.Context,
	req oapi.PutMeUserRequestObject,
) (oapi.PutMeUserResponseObject, error) {
	return oapi.PutMeUser200JSONResponse{}, nil
}
