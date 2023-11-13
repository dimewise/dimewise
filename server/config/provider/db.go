package provider

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq" // Loading postgres driver
)

func NewDBProvider(env *EnvProvider) *sql.DB {
	db, err := sql.Open("postgres", env.DBUrl)
	if err != nil {
		log.Fatal("Unable to connect to database")
	}

	return db
}
