package handler

import (
	"github.com/teoyi/dimewise/config"
	"github.com/teoyi/dimewise/oapi"
)

type Handler struct {
	oapi.StrictServerInterface
	App *config.App
}

func NewHandler(app *config.App) *Handler {
	return &Handler{
		App: app,
	}
}
