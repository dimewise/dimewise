package dto

import (
	"time"

	"github.com/google/uuid"

	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/generated/oapi"
)

func NewPaymentMethod(userID uuid.UUID, form oapi.PaymentMethodCreate) model.PaymentMethod {
	now := time.Now()

	newPaymentMethod := model.PaymentMethod{
		ID:         uuid.New(),
		UserID:     userID,
		Title:      form.Title,
		MethodType: model.PaymentMethodType(form.MethodType),
		DeletedAt:  nil,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	return newPaymentMethod
}

func TransformModelPaymentMethodToOAPIPaymentMethod(
	paymentMethod model.PaymentMethod,
) oapi.PaymentMethod {
	return oapi.PaymentMethod{
		Id:         paymentMethod.ID,
		UserId:     paymentMethod.UserID,
		Title:      paymentMethod.Title,
		MethodType: oapi.PaymentMethodType(paymentMethod.MethodType),
		CreatedAt:  paymentMethod.CreatedAt,
		UpdatedAt:  paymentMethod.UpdatedAt,
		DeletedAt:  paymentMethod.DeletedAt,
	}
}

func BatchTransformModelPaymentMethodToOAPIPaymentMethod(
	paymentMethods []model.PaymentMethod,
) []oapi.PaymentMethod {
	oapiPaymentMethods := make([]oapi.PaymentMethod, 0, len(paymentMethods))

	for _, paymentMethod := range paymentMethods {
		oapiPaymentMethod := oapi.PaymentMethod{
			Id:         paymentMethod.ID,
			UserId:     paymentMethod.UserID,
			Title:      paymentMethod.Title,
			MethodType: oapi.PaymentMethodType(paymentMethod.MethodType),
			CreatedAt:  paymentMethod.CreatedAt,
			UpdatedAt:  paymentMethod.UpdatedAt,
			DeletedAt:  paymentMethod.DeletedAt,
		}
		oapiPaymentMethods = append(oapiPaymentMethods, oapiPaymentMethod)
	}

	return oapiPaymentMethods
}

func UpdatePaymentMethodByForm(
	paymentMethod model.PaymentMethod,
	form oapi.PaymentMethodUpdate,
) model.PaymentMethod {
	now := time.Now()

	updatedPaymentMethod := paymentMethod
	updatedPaymentMethod.MethodType = model.PaymentMethodType(form.MethodType)
	updatedPaymentMethod.Title = form.Title
	updatedPaymentMethod.UpdatedAt = now

	return updatedPaymentMethod
}
