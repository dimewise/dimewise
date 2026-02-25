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
}

func NewHandler(
	householdService *service.HouseholdService,
	budgetService *service.BudgetService,
	expenseService *service.ExpenseService,
	reportService *service.ReportService,
	userService *service.UserService,
) *Handler {
	h := Handler{
		householdService: householdService,
		budgetService:    budgetService,
		expenseService:   expenseService,
		reportService:    reportService,
		userService:      userService,
	}

	return &h
}
