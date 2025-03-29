from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = Field(default="Dimewise", validation_alias="APP_NAME")
    app_env: str = Field(default=..., validation_alias="APP_ENV")
    app_api_version: str = Field(default=..., validation_alias="APP_API_VERSION")

    db_url: str = Field(default=..., validation_alias="DATABASE_URL")
    jwt_token: str = Field(default=..., validation_alias="JWT_TOKEN")
    clerk_secret_key: str = Field(default=..., validation_alias="CLERK_SECRET_KEY")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
