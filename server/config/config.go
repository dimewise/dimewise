package config

import (
	"database/sql"

	"github.com/dimewise/dimewise/config/provider"

	"github.com/clerk/clerk-sdk-go/v2/user"
)

type Config struct {
	env   *provider.EnvProvider
	db    *sql.DB
	clerk *user.Client
}

func (c *Config) Env() *provider.EnvProvider {
	return c.env
}

func (c *Config) DB() *sql.DB {
	if c.db == nil {
		c.db = provider.NewDBProvider(c.env)
	}

	return c.db
}

func (c *Config) Clerk() *user.Client {
	if c.clerk == nil {
		c.clerk = provider.NewClerkProvider(c.env)
	}

	return c.clerk
}

func NewConfig() *Config {
	config := Config{}

	config.env = provider.NewEnvProvider()

	return &config
}
