from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_PORT: int = 8000
    APP_HOST: str = "0.0.0.0"
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    KC_SERVER_URL: str
    KC_REALM_NAME: str
    KC_CLIENT_ID: str
    KC_AUTHORIZATION_URL: str | None = None
    KC_TOKEN_URL: str | None = None

    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2:1b"

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

settings = Settings()