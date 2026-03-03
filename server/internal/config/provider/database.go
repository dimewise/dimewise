package provider

import (
	"context"
	"database/sql"
	"log/slog"
	"os"
	"time"

	_ "github.com/lib/pq" // needed for pg driver
)

const (
	connMaxLifetime = 5 * time.Minute
	connMaxIdleTime = 5 * time.Minute
)

func NewDBProvider(env *EnvProvider) *sql.DB {
	db, err := sql.Open("postgres", env.databaseURL)
	if err != nil {
		slog.Default().Error("Unable to connect to database", slog.Any("err", err))
		os.Exit(1)
	}

	if err = db.PingContext(context.Background()); err != nil {
		slog.Default().Error("Unable to ping database", slog.Any("err", err))
		os.Exit(1)
	}

	db.SetMaxOpenConns(env.databaseMaxConns)
	db.SetMaxIdleConns(env.databaseMaxConns)
	db.SetConnMaxLifetime(connMaxLifetime)
	db.SetConnMaxIdleTime(connMaxIdleTime)

	return db
}

// TODO: add test db when needed
