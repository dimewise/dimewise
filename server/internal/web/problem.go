package web

import (
	"dimewise/generated/oapi"
)

func newProblem(status int, title string, detail string) oapi.ProblemDetails {
	return oapi.ProblemDetails{
		Status: &status,
		Title:  &title,
		Detail: &detail,
	}
}
