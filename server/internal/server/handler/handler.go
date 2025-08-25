package handler

import (
	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/oapi"
)

type Handler struct {
	oapi.StrictServerInterface
	config *config.Config
}

func NewHandler(config *config.Config) *Handler {
	handler := Handler{
		config: config,
	}

	return &handler
}
