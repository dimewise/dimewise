package provider

import (
	"log"
	"strconv"
)

type EnvProvider struct {
	appEnv           string
	serverPort       string
	databaseURL      string
	databaseMaxConns int
	clerkSecretKey   string
}

func (e *EnvProvider) AppEnv() string {
	return e.appEnv
}

func (e *EnvProvider) ServerPort() string {
	return e.serverPort
}

func NewEnvProvider() *EnvProvider {
	// app
	appEnv := fallbackEnvLookup("APP_ENV", "local")
	serverPort := fallbackEnvLookup("SERVER_PORT", "8080")

	// database
	databaseURL := requiredEnvLookup("DATABASE_URL")
	databaseMaxConns := fallbackEnvLookup("DATABASE_MAX_CONNS", "5")
	parsedDatabaseMaxConns, err := strconv.Atoi(databaseMaxConns)
	if err != nil {
		log.Fatalf("Failed to parse env value 'DATABASE_MAX_CONNS' as an int: %v", err)
	}

	// clerk auth
	clerkSecretKey := requiredEnvLookup("CLERK_SECRET_KEY")

	envProvider := EnvProvider{
		appEnv:           appEnv,
		serverPort:       serverPort,
		databaseURL:      databaseURL,
		databaseMaxConns: parsedDatabaseMaxConns,
		clerkSecretKey:   clerkSecretKey,
	}

	return &envProvider
}
