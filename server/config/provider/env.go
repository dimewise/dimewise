package provider

import "github.com/spf13/viper"

type EnvProvider struct {
	APP_ENV        string `mapstructure:"APP_ENV"`
	APP_PORT       string `mapstructure:"APP_PORT"`
	DB_URL         string `mapstructure:"DATABASE_URL"`
	LOG_LEVEL      string `mapstructure:"LOG_LEVEL"`
	AUTH0_DOMAIN   string `mapstructure:"AUTH0_DOMAIN"`
	AUTH0_AUDIENCE string `mapstructure:"AUTH0_AUDIENCE"`
}

func NewEnvProvider() (*EnvProvider, error) {
	viper.AddConfigPath(".")
	viper.SetConfigName("app")
	viper.SetConfigType("env")

	viper.AutomaticEnv()
	err := viper.ReadInConfig()
	if err != nil {
		return nil, err
	}

	var envProvider *EnvProvider
	err = viper.Unmarshal(&envProvider)
	if err != nil {
		return nil, err
	}
	return envProvider, err
}
