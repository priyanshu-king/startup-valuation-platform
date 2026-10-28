"""
Core Configuration
==================
Reads all settings from environment variables / .env file.
Uses pydantic-settings for typed, validated configuration.
"""

from functools import lru_cache
from typing import List
from urllib.parse import urlsplit

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ─────────────────────────────────────────
    APP_NAME: str = "AI Startup Valuation Platform"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ── Server ──────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── CORS ────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # ── Database ────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./data/startup_valuation.db"

    # ── AI Provider ─────────────────────────────────────────
    AI_PROVIDER: str = "mock"          # mock | openai | anthropic | google
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"
    GOOGLE_API_KEY: str = ""
    GOOGLE_MODEL: str = "gemini-1.5-pro"

    # ── Valuation Engine ────────────────────────────────────
    DEFAULT_DISCOUNT_RATE: float = 0.15
    DEFAULT_TERMINAL_GROWTH_RATE: float = 0.03

    # ── Security ────────────────────────────────────────────
    SESSION_MAX_AGE_DAYS: int = 14

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.ENVIRONMENT.lower() == "production":
            if self.DEBUG:
                raise ValueError("DEBUG must be false in production.")
            origins = self.cors_origins_list
            if not origins or any(
                origin == "*" or urlsplit(origin).scheme != "https" or not urlsplit(origin).netloc
                for origin in origins
            ):
                raise ValueError("Production CORS_ORIGINS must list explicit HTTPS trusted origins.")
        if self.SESSION_MAX_AGE_DAYS < 1 or self.SESSION_MAX_AGE_DAYS > 30:
            raise ValueError("SESSION_MAX_AGE_DAYS must be between 1 and 30.")
        return self


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings singleton."""
    return Settings()


# Module-level convenience alias
settings: Settings = get_settings()
