package handler

import (
	"context"

	"github.com/dimewise/dimewise/generated/oapi"
)

func (h *Handler) GetPaymentMethods(
	ctx context.Context,
	req oapi.GetPaymentMethodsRequestObject,
) (oapi.GetPaymentMethodsResponseObject, error) {
	return oapi.GetPaymentMethods200JSONResponse{}, nil
}

func (h *Handler) PostPaymentMethod(
	ctx context.Context,
	req oapi.PostPaymentMethodRequestObject,
) (oapi.PostPaymentMethodResponseObject, error) {
	return oapi.PostPaymentMethod201JSONResponse{}, nil
}

func (h *Handler) DeletePaymentMethodjById(
	ctx context.Context,
	req oapi.DeletePaymentMethodByIdRequestObject,
) (oapi.DeletePaymentMethodByIdResponseObject, error) {
	return oapi.DeletePaymentMethodById200JSONResponse{}, nil
}

func (h *Handler) GetPaymentMethodById(
	ctx context.Context,
	req oapi.GetPaymentMethodByIdRequestObject,
) (oapi.GetPaymentMethodByIdResponseObject, error) {
	return oapi.GetPaymentMethodById200JSONResponse{}, nil
}

func (h *Handler) PutPaymentMethodById(
	ctx context.Context,
	req oapi.PutPaymentMethodByIdRequestObject,
) (oapi.PutPaymentMethodByIdResponseObject, error) {
	return oapi.PutPaymentMethodById200JSONResponse{}, nil
}
