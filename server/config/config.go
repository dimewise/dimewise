package config

import (
	"database/sql"
	"log"

	"github.com/teoyi/dimewise/config/provider"
)

type App struct {
	env *provider.EnvProvider
	db  *sql.DB
}

func NewApp() *App {
	a := &App{} //nolint:exhaustruct // config added after
	env, err := provider.NewEnvProvider()
	if err != nil {
		log.Fatalf("error setting environment variables: %v", err)
	}
	a.env = env

	return a
}

func (a *App) EnvVars() *provider.EnvProvider {
	if a.env == nil {
		env, err := provider.NewEnvProvider()
		if err != nil {
			log.Fatalf("error setting environment variables: %v", err)
		}
		a.env = env
	}
	return a.env
}

func (a *App) DB() *sql.DB {
	if a.db == nil {
		a.db = provider.NewDBProvider(a.env)
	}
	return a.db
}
