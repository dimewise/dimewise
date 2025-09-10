package handler

import (
	"context"

	"github.com/go-errors/errors"

	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/server/service"
	paymentmethodsvc "github.com/dimewise/dimewise/internal/server/service/payment_method"
)

func (h *Handler) GetPaymentMethods(
	ctx context.Context,
	req oapi.GetPaymentMethodsRequestObject,
) (oapi.GetPaymentMethodsResponseObject, error) {
	res, err := paymentmethodsvc.GetPaymentMethods(ctx, h.config, req.Params)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.GetPaymentMethods401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
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

	return oapi.GetPaymentMethods200JSONResponse(*res), nil
}

func (h *Handler) PostPaymentMethod(
	ctx context.Context,
	req oapi.PostPaymentMethodRequestObject,
) (oapi.PostPaymentMethodResponseObject, error) {
	res, err := paymentmethodsvc.CreatePaymentMethod(ctx, h.config, *req.Body)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				return oapi.PostPaymentMethod400JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeUnauthorized:
				return oapi.PostPaymentMethod401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
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

	return oapi.PostPaymentMethod201JSONResponse(*res), nil
}

func (h *Handler) DeletePaymentMethodById( //nolint:revive // generated name from oapi spec
	ctx context.Context,
	req oapi.DeletePaymentMethodByIdRequestObject,
) (oapi.DeletePaymentMethodByIdResponseObject, error) {
	err := paymentmethodsvc.DeletePaymentMethod(ctx, h.config, req.PaymentMethodId)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.DeletePaymentMethodById401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
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
	return oapi.DeletePaymentMethodById200JSONResponse{Success: true}, nil
}

func (h *Handler) GetPaymentMethodById(
	ctx context.Context,
	req oapi.GetPaymentMethodByIdRequestObject,
) (oapi.GetPaymentMethodByIdResponseObject, error) {
	res, err := paymentmethodsvc.GetPaymentMethodByID(ctx, h.config, req.PaymentMethodId)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				fallthrough
			case service.ErrCodeUnauthorized:
				return oapi.GetPaymentMethodById401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				return oapi.GetPaymentMethodById404JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.GetPaymentMethodById200JSONResponse(*res), nil
}

func (h *Handler) PutPaymentMethodById(
	ctx context.Context,
	req oapi.PutPaymentMethodByIdRequestObject,
) (oapi.PutPaymentMethodByIdResponseObject, error) {
	res, err := paymentmethodsvc.UpdatePaymentMethod(ctx, h.config, req.PaymentMethodId, *req.Body)
	if err != nil {
		var se *service.Error
		if errors.As(err, &se) {
			switch se.Code {
			case service.ErrCodeBadRequest:
				return oapi.PutPaymentMethodById400JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeUnauthorized:
				return oapi.PutPaymentMethodById401JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			case service.ErrCodeForbidden:
				fallthrough
			case service.ErrCodeNotFound:
				return oapi.PutPaymentMethodById404JSONResponse{
					Code:    string(se.Code),
					Success: false,
				}, nil
			default:
				return nil, err
			}
		}
		return nil, err
	}

	return oapi.PutPaymentMethodById200JSONResponse(*res), nil
}
