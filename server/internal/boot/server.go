package boot

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
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

const (
	corsMaxAge         = 300
	readHeaderTimeout  = 10 * time.Second
	gracefulShutdownTO = 10 * time.Second
)

type Server struct {
	router     *chi.Mux
	httpServer *http.Server
	portAddr   string
}

func NewServer(config *config.Config) *Server {
	// Repositories
	userRepo := repository.NewUserRepository(config.DB())
	householdRepo := repository.NewHouseholdRepository(config.DB())
	budgetRepo := repository.NewBudgetRepository(config.DB())
	expenseRepo := repository.NewExpenseRepository(config.DB())
	reportRepo := repository.NewReportRepository(config.DB())

	// Services
	userService := service.NewUserService(userRepo)
	householdService := service.NewHouseholdService(householdRepo, userRepo)
	budgetService := service.NewBudgetService(budgetRepo, householdRepo)
	expenseService := service.NewExpenseService(expenseRepo, householdRepo)
	reportService := service.NewReportService(reportRepo, expenseRepo, householdRepo, budgetRepo)

	// Handler
	h := web.NewHandler(
		householdService,
		budgetService,
		expenseService,
		reportService,
		userService,
	)
	portAddr := fmt.Sprintf(":%s", config.Env().ServerPort())

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{config.Env().ClientURL()},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           corsMaxAge,
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
				slog.Default().
					ErrorContext(r.Context(), "Internal server error occurred", slog.Any("err", err))
				http.Error(w, "Internal server error", http.StatusInternalServerError)
			},
		}
		strictHandler := oapi.NewStrictHandlerWithOptions(
			h,
			[]oapi.StrictMiddlewareFunc{},
			serverOptions,
		)

		oapi.HandlerFromMuxWithBaseURL(strictHandler, r, baseURL)
	})

	httpServer := &http.Server{
		Handler:           r,
		Addr:              portAddr,
		ReadHeaderTimeout: readHeaderTimeout,
	}

	return &Server{
		router:     r,
		httpServer: httpServer,
		portAddr:   portAddr,
	}
}

func (s *Server) Start() {
	slog.Default().Info("Server listening on " + s.portAddr)

	// Graceful shutdown on SIGINT/SIGTERM.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		slog.Default().Info("Shutting down server...")

		ctx, cancel := context.WithTimeout(context.Background(), gracefulShutdownTO)
		defer cancel()

		if err := s.httpServer.Shutdown(ctx); err != nil {
			slog.Default().Error("Server forced to shutdown", slog.Any("err", err))
		}
	}()

	err := s.httpServer.ListenAndServe()
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		slog.Default().
			Error("Error starting server on "+s.portAddr, slog.Any("err", err))
		os.Exit(1)
	}
}

func (s *Server) Router() *chi.Mux {
	return s.router
}
