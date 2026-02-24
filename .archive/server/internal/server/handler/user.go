package handler

import (
	"context"

	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/server/service"
	usersvc "github.com/dimewise/dimewise/internal/server/service/user"
)

func (h *Handler) PostMeUser(
	ctx context.Context,
	req oapi.PostMeUserRequestObject,
) (oapi.PostMeUserResponseObject, error) {
	res, err := usersvc.CreateUser(ctx, h.config, *req.Body)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				return oapi.PostMeUser400JSONResponse{Code: string(se.Code), Success: false}, nil
			case service.ErrCodeUnauthorized:
				fallthrough
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				fallthrough
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.PostMeUser201JSONResponse(*res), nil
}

func (h *Handler) GetMeUser(
	ctx context.Context,
	_ oapi.GetMeUserRequestObject,
) (oapi.GetMeUserResponseObject, error) {
	res, err := usersvc.GetUser(ctx, h.config)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.GetMeUser401JSONResponse{Code: string(se.Code), Success: false}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				return oapi.GetMeUser404JSONResponse{Code: string(se.Code), Success: false}, nil
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.GetMeUser200JSONResponse(*res), nil
}

func (h *Handler) PutMeUser(
	ctx context.Context,
	req oapi.PutMeUserRequestObject,
) (oapi.PutMeUserResponseObject, error) {
	res, err := usersvc.UpdateUser(ctx, h.config, *req.Body)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				return oapi.PutMeUser400JSONResponse{Code: string(se.Code), Success: false}, nil
			case service.ErrCodeUnauthorized:
				return oapi.PutMeUser401JSONResponse{Code: string(se.Code), Success: false}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				fallthrough
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.PutMeUser200JSONResponse(*res), nil
}
