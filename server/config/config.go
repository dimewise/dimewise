package config

import (
	"database/sql"
	"path"
	"runtime"

	"github.com/teoyi/dimewise/config/provider"
)

type App struct {
	env     *provider.EnvProvider
	db      *sql.DB
	rootDir string
}

func NewApp() *App {
	a := &App{}
	a.env = provider.NewEnvProvider()
	a.setRootDir()

	return a

}

func (a *App) EnvVars() *provider.EnvProvider {
	if a.env == nil {
		a.env = provider.NewEnvProvider()
	}
	return a.env
}

func (a *App) DB() *sql.DB {
	if a.db == nil {
		a.db = provider.NewDBProvider(a.env)
	}
	return a.db
}

func (a *App) setRootDir() {
	_, b, _, _ := runtime.Caller(0)
	a.rootDir = path.Join(path.Dir(b), "..")
}
