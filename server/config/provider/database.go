package provider

import (
	"database/sql"
	"log"
)

func NewDBProvider(env *EnvProvider) *sql.DB {
	db, err := sql.Open("postgres", env.databaseURL)
	if err != nil {
		log.Fatal("Unable to connect to database")
	}

	db.SetMaxOpenConns(env.databaseMaxConns)

	return db
}

// TODO: add test db when needed
