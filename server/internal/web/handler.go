package web

import (
	"dimewise/generated/oapi"
	"dimewise/internal/service"
)

type Handler struct {
	oapi.StrictServerInterface

	householdService  *service.HouseholdService
	budgetService     *service.BudgetService
	expenseService    *service.ExpenseService
	settlementService *service.SettlementService
	userService       *service.UserService
}

func NewHandler(
	householdService *service.HouseholdService,
	budgetService *service.BudgetService,
	expenseService *service.ExpenseService,
	settlementService *service.SettlementService,
	userService *service.UserService,
) *Handler {
	h := Handler{
		householdService:  householdService,
		budgetService:     budgetService,
		expenseService:    expenseService,
		settlementService: settlementService,
		userService:       userService,
	}

	return &h
}
