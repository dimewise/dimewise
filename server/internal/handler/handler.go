package handler

import (
	"github.com/teoyi/dimewise/config"
	"github.com/teoyi/dimewise/internal/repository"
	"github.com/teoyi/dimewise/oapi"
)

type Handler struct {
	oapi.StrictServerInterface
	App  *config.App
	Repo *repository.Repository
}

func NewHandler(app *config.App, repo *repository.Repository) *Handler {
	return &Handler{ //nolint: exhaustruct // oapi not needed for declaration
		App:  app,
		Repo: repo,
	}
}
