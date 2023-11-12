package provider

import "github.com/spf13/viper"

type EnvProvider struct {
	AppEnv        string `mapstructure:"APP_ENV"`
	AppPort       string `mapstructure:"APP_PORT"`
	DBUrl         string `mapstructure:"DATABASE_URL"`
	LogLevel      string `mapstructure:"LOG_LEVEL"`
	Auth0Domain   string `mapstructure:"AUTH0_DOMAIN"`
	Auth0Audience string `mapstructure:"AUTH0_AUDIENCE"`
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
