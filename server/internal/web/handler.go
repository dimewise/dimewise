package web

import (
	"dimewise/generated/oapi"
	"dimewise/internal/service"
)

type Handler struct {
	oapi.StrictServerInterface

	householdService *service.HouseholdService
	budgetService    *service.BudgetService
	expenseService   *service.ExpenseService
	reportService    *service.ReportService
	userService      *service.UserService
	balanceService   *service.BalanceService
}

func NewHandler(
	householdService *service.HouseholdService,
	budgetService *service.BudgetService,
	expenseService *service.ExpenseService,
	reportService *service.ReportService,
	userService *service.UserService,
	balanceService *service.BalanceService,
) *Handler {
	h := Handler{
		householdService: householdService,
		budgetService:    budgetService,
		expenseService:   expenseService,
		reportService:    reportService,
		userService:      userService,
		balanceService:   balanceService,
	}

	return &h
}
