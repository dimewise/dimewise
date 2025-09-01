package provider

import (
	"database/sql"
	"log/slog"
	"os"
)

func NewDBProvider(env *EnvProvider) *sql.DB {
	db, err := sql.Open("postgres", env.databaseURL)
	if err != nil {
		slog.Default().Error("Unable to connect to database")
		os.Exit(1)
	}

	db.SetMaxOpenConns(env.databaseMaxConns)

	return db
}

// TODO: add test db when needed
