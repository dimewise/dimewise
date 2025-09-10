package dto

import (
	"time"

	"github.com/google/uuid"

	"github.com/dimewise/dimewise/generated/dimewise/public/model"
	"github.com/dimewise/dimewise/generated/oapi"
)

type ExpenseFull struct {
	Expense       model.Expense
	Category      model.Category
	PaymentMethod model.PaymentMethod
}

func NewExpense(userID uuid.UUID, form oapi.ExpenseCreate) model.Expense {
	now := time.Now()

	newExpense := model.Expense{
		ID:              uuid.New(),
		UserID:          userID,
		CategoryID:      form.CategoryId,
		PaymentMethodID: form.PaymentMethodId,
		Title:           form.Title,
		Description:     form.Description,
		Amount:          int64(form.Amount),
		Currency:        model.CurrencyType(form.Currency),
		IncurredAt:      form.IncurredAt,
		VerifiedAt:      nil,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	return newExpense
}

func BatchTransformDTOExpenseFullToOAPIExpenseWithDetails(
	expenseFull []ExpenseFull,
) []oapi.ExpenseWithDetails {
	oapiExpenseWithDetails := make([]oapi.ExpenseWithDetails, 0, len(expenseFull))

	for _, ele := range expenseFull {
		expenseWithDetail := oapi.ExpenseWithDetails{
			Id:              ele.Expense.ID,
			UserId:          ele.Expense.UserID,
			CategoryId:      ele.Expense.CategoryID,
			PaymentMethodId: ele.Expense.PaymentMethodID,
			Title:           ele.Expense.Title,
			Description:     ele.Expense.Description,
			Amount:          int(ele.Expense.Amount),
			Currency:        oapi.CurrencyType(ele.Expense.Currency),
			IncurredAt:      ele.Expense.IncurredAt,
			VerifiedAt:      ele.Expense.VerifiedAt,
			CreatedAt:       ele.Expense.CreatedAt,
			UpdatedAt:       ele.Expense.UpdatedAt,
			Category:        TransformModelCategoryToOAPICategory(ele.Category),
			PaymentMethod:   TransformModelPaymentMethodToOAPIPaymentMethod(ele.PaymentMethod),
		}

		oapiExpenseWithDetails = append(oapiExpenseWithDetails, expenseWithDetail)
	}

	return oapiExpenseWithDetails
}

func TransformExpenseFullToOAPIExpenseWithDetails(expenseFull ExpenseFull) oapi.ExpenseWithDetails {
	return oapi.ExpenseWithDetails{
		Id:              expenseFull.Expense.ID,
		UserId:          expenseFull.Expense.UserID,
		CategoryId:      expenseFull.Expense.CategoryID,
		PaymentMethodId: expenseFull.Expense.PaymentMethodID,
		Title:           expenseFull.Expense.Title,
		Description:     expenseFull.Expense.Description,
		Amount:          int(expenseFull.Expense.Amount),
		Currency:        oapi.CurrencyType(expenseFull.Expense.Currency),
		IncurredAt:      expenseFull.Expense.IncurredAt,
		VerifiedAt:      expenseFull.Expense.VerifiedAt,
		CreatedAt:       expenseFull.Expense.CreatedAt,
		UpdatedAt:       expenseFull.Expense.UpdatedAt,
		Category:        TransformModelCategoryToOAPICategory(expenseFull.Category),
		PaymentMethod:   TransformModelPaymentMethodToOAPIPaymentMethod(expenseFull.PaymentMethod),
	}
}

func UpdateExpenseByForm(expense model.Expense, form oapi.ExpenseUpdate) model.Expense {
	now := time.Now()

	updatedExpense := expense
	updatedExpense.Amount = int64(form.Amount)
	updatedExpense.CategoryID = form.CategoryId
	updatedExpense.Currency = model.CurrencyType(form.Currency)
	updatedExpense.Description = form.Description
	updatedExpense.IncurredAt = form.IncurredAt
	updatedExpense.PaymentMethodID = form.PaymentMethodId
	updatedExpense.Title = form.Title
	updatedExpense.UpdatedAt = now

	return updatedExpense
}

func VerifyExpense(expense model.Expense) model.Expense {
	now := time.Now()

	updatedExpense := expense
	updatedExpense.VerifiedAt = &now
	updatedExpense.UpdatedAt = now

	return updatedExpense
}
