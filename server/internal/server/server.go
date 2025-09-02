package server

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

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

		// TODO: add StrictHTTPServerOptions
		strictHandler := oapi.NewStrictHandlerWithOptions(
			h,
			[]oapi.StrictMiddlewareFunc{},
			oapi.StrictHTTPServerOptions{},
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
