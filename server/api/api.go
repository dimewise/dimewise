package api

import (
	"log"
	"net/http"
	"net/url"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/teoyi/dimewise/api/middleware"
	"github.com/teoyi/dimewise/config"
	"github.com/teoyi/dimewise/internal/handler"
	"github.com/teoyi/dimewise/oapi"
	"golang.org/x/exp/slog"
)

const (
	routerMaxAge = 300
)

type API struct {
	router *chi.Mux
	port   string
}

func NewAPI(app *config.App) *API {
	h := handler.NewHandler(app)
	p := ":" + app.EnvVars().AppPort

	auth0IssuerURL, err := url.Parse("https://" + app.EnvVars().Auth0Domain + "/")
	if err != nil {
		log.Fatalf("Failed to parse the issuer url: %v", err)
	}

	// standard config for router
	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Heartbeat("/ping"))
	r.Use(cors.Handler(cors.Options{ //nolint: exhaustruct // temporary unused
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"http://localhost:3000", auth0IssuerURL.String()},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           routerMaxAge, // Maximum value not ignored by any of major browsers
	}))

	// OpenAPI defined routes
	r.Route("/api/v1", func(r chi.Router) {
		r.Use(middleware.EnsureValidToken(app))
		r.Use(middleware.UserCheck(app))
		strictHandler := oapi.NewStrictHandler(h, []oapi.StrictMiddlewareFunc{})
		oapi.HandlerFromMuxWithBaseURL(strictHandler, r, "")
	})

	return &API{
		router: r,
		port:   p,
	}
}

func (a *API) Serve() {
	slog.Info("Dimewise API server listening on " + a.port)

	const maxHeaderBytes = 1 << 20
	const readTimeout = 5 * time.Second
	const writeTimeout = 30 * time.Second

	s := &http.Server{
		Handler:        a.router,
		Addr:           a.port,
		ReadTimeout:    readTimeout,
		WriteTimeout:   writeTimeout,
		MaxHeaderBytes: maxHeaderBytes,
	}

	log.Fatal(s.ListenAndServe())
}
