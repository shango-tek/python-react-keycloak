from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_PORT: int = 8000
    APP_HOST: str = "0.0.0.0"
    DEBUG: bool = False  # set DEBUG=true in .env to enable SQLAlchemy query logging
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    KC_SERVER_URL: str
    KC_REALM_NAME: str
    KC_CLIENT_ID: str
    KC_AUTHORIZATION_URL: str | None = None
    KC_TOKEN_URL: str | None = None

    POSTGRES_USER: str = "keycloak"
    POSTGRES_PASSWORD: str = "keycloak123"
    POSTGRES_DB: str = "app_data"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:3b"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def keycloak_authorization_url(self) -> str:
        if self.KC_AUTHORIZATION_URL:
            return self.KC_AUTHORIZATION_URL
        return f"{self.KC_SERVER_URL}/realms/{self.KC_REALM_NAME}/protocol/openid-connect/auth"

    @property
    def keycloak_token_url(self) -> str:
        if self.KC_TOKEN_URL:
            return self.KC_TOKEN_URL
        return f"{self.KC_SERVER_URL}/realms/{self.KC_REALM_NAME}/protocol/openid-connect/token"

    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()