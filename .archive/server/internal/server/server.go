package server

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"github.com/dimewise/dimewise/config"
	"github.com/dimewise/dimewise/generated/oapi"
	"github.com/dimewise/dimewise/internal/server/handler"
	"github.com/dimewise/dimewise/internal/server/middleware"
)

type Server struct {
	router   *chi.Mux
	portAddr string
}

func NewServer(config *config.Config) *Server {
	clerk.SetKey(config.Env().ClerkSecretKey())
	h := handler.NewHandler(config)
	portAddr := fmt.Sprintf(":%s", config.Env().ServerPort())

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	/* -- Health -- */
	r.Get("/v1/health", h.GetHealth)

	/* -- Private OAPI -- */
	r.Group(func(r chi.Router) {
		baseURL := "/v1"

		// clerk auth middleware
		r.Use(middleware.NewClerkAuthMiddleware(config))
		r.Use(middleware.NewLoadAppUserMiddleware(config))

		serverOptions := oapi.StrictHTTPServerOptions{
			RequestErrorHandlerFunc: func(w http.ResponseWriter, _ *http.Request, err error) {
				http.Error(w, err.Error(), http.StatusBadRequest)
			},
			ResponseErrorHandlerFunc: func(w http.ResponseWriter, r *http.Request, err error) {
				errMsg := "Internal server error occurred"
				slog.Default().ErrorContext(r.Context(), errMsg, slog.Any("err", err))

				http.Error(w, err.Error(), http.StatusInternalServerError)
			},
		}
		strictHandler := oapi.NewStrictHandlerWithOptions(
			h,
			[]oapi.StrictMiddlewareFunc{},
			serverOptions,
		)

		oapi.HandlerFromMuxWithBaseURL(strictHandler, r, baseURL)
	})

	return &Server{
		router:   r,
		portAddr: portAddr,
	}
}

func (s *Server) Start() {
	slog.Default().Info("Server listening on " + s.portAddr)

	headerTimeout := 1000
	httpServer := &http.Server{
		Handler:           s.router,
		Addr:              s.portAddr,
		ReadHeaderTimeout: time.Duration(headerTimeout) * time.Second,
	}

	err := httpServer.ListenAndServe()
	if err != nil {
		slog.Default().
			Error("Error starting server on "+s.portAddr, slog.Any("err", err))
		os.Exit(1)
	}
}

func (s *Server) Router() *chi.Mux {
	return s.router
}
