package handler

import (
	"net/http"

	"github.com/teoyi/dimewise/config"
)

type Handler struct {
	App *config.App
}

func NewHandler(app *config.App) *Handler {
	return &Handler{
		App: app,
	}
}

func (h *Handler) GetFunny(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("OK"))
}
