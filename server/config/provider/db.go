package provider

import (
	"database/sql"
	"log"
)

func NewDBProvider(env *EnvProvider) *sql.DB {
	db, err := sql.Open("postgres", env.DatabaseURL)
	if err != nil {
		log.Fatal("Unable to connect to database")
	}

	return db
}
