from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App settings loaded from environment variables / .env file."""

    # Reads the repo-root .env when run from backend/ (real env vars always win)
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")

    app_name: str = "AI Support Tickets API"
    app_version: str = "1.0.0"

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/tickets"

    # LLM provider (Groq exposes an OpenAI-compatible API)
    llm_api_key: str = "" 
    llm_base_url: str = "https://api.groq.com/openai/v1"
    llm_model: str = "openai/gpt-oss-20b"
    llm_timeout_seconds: float = 10.0

    cors_origins: str = "http://localhost:3000"
    log_level: str = "INFO"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
