package handler

import (
	"net/http"
)

func (h *Handler) AuthLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"message":"Hello from a private endpoint! You need to be authenticated to see this."}`))
}

func (h *Handler) Test(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"message":"Hello from a private endpoint! You need to be authenticated to see this."}`))
}
