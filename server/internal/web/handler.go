package web

import (
	"dimewise/generated/oapi"
	"dimewise/internal/service"
)

type Handler struct {
	oapi.StrictServerInterface

	householdService *service.HouseholdService
	budgetService    *service.BudgetService
	userService      *service.UserService
}

func NewHandler(
	householdService *service.HouseholdService,
	budgetService *service.BudgetService,
	userService *service.UserService,
) *Handler {
	h := Handler{
		householdService: householdService,
		budgetService:    budgetService,
		userService:      userService,
	}

	return &h
}
