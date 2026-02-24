package boot

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"dimewise/generated/oapi"
	"dimewise/internal/config"
	"dimewise/internal/middleware"
	"dimewise/internal/repository"
	"dimewise/internal/service"
	"dimewise/internal/web"
)

type Server struct {
	router   *chi.Mux
	portAddr string
}

func NewServer(config *config.Config) *Server {
	// Repositories
	userRepo := repository.NewUserRepository(config.DB())
	householdRepo := repository.NewHouseholdRepository(config.DB())
	budgetRepo := repository.NewBudgetRepository(config.DB())

	// Services
	userService := service.NewUserService(userRepo)
	householdService := service.NewHouseholdService(householdRepo, userRepo)
	budgetService := service.NewBudgetService(budgetRepo, householdRepo)

	// Handler
	h := web.NewHandler(householdService, budgetService, userService)
	portAddr := fmt.Sprintf(":%s", config.Env().ServerPort())

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{config.Env().ClientURL()},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", h.GetHealth)
	r.Group(func(r chi.Router) {
		baseURL := ""

		// clerk auth middleware (now also upserts user)
		r.Use(middleware.NewClerkAuthMiddleware(userService))

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
