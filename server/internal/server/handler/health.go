package handler

import (
	"fmt"
	"net/http"
)

func (h *Handler) GetHealth(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, err := w.Write([]byte("Health check successful"))
	if err != nil {
		panic(fmt.Errorf("Failed to write response body: %w", err))
	}
}
