package provider

import "os"

type EnvProvider struct {
	AppEnv      string
	AppPort     string
	DatabaseURL string
	LogLevel    string
}

func NewEnvProvider() *EnvProvider {
	appEnv, exists := os.LookupEnv("APP_ENV")
	if !exists {
		appEnv = "local"
	}

	appPort, exists := os.LookupEnv("APP_PORT")
	if !exists {
		appPort = "3001"
	}

	logLevel, exists := os.LookupEnv("LOG_LEVEL")
	if !exists {
		logLevel = "debug"
	}

	databaseURL, _ := os.LookupEnv("DATABASE_URL")

	envProvider := &EnvProvider{
		AppEnv:      appEnv,
		AppPort:     appPort,
		DatabaseURL: databaseURL,
		LogLevel:    logLevel,
	}

	return envProvider
}
