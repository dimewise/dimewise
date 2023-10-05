package api

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/teoyi/dimewise/config"
	"github.com/teoyi/dimewise/internal/handler"
	"golang.org/x/exp/slog"
)

type Api struct {
	router *chi.Mux
	port   string
}

func NewApi(app *config.App) *Api {
	h := handler.NewHandler(app)
	p := ":" + app.EnvVars().AppPort

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Heartbeat("/ping"))

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/", h.GetFunny)
	})

	return &Api{
		router: r,
		port:   p,
	}
}

func (a *Api) Serve() {
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
