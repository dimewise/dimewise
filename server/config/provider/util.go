package provider

import (
	"log"
	"os"
)

// fallbackEnvLookup allows for declaration of fallback string, guarantees a return value
func fallbackEnvLookup(key string, fallback string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return fallback
	}

	return value
}

// requiredEnvLookup requires env var to exist
func requiredEnvLookup(key string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		log.Fatalf("Missing env value for key: %s", key)
	}

	return value
}
