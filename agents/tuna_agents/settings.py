"""Tuna agents — runtime configuration."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All Tuna agent configuration. Env vars take precedence over .env."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="TUNA_", extra="ignore")

    # GCP
    project_id: str = "tuna-ai"
    region: str = "asia-south1"

    # Models — keep these as the only place model names live
    model_pro: str = "gemini-3.1-pro-preview"
    model_flash: str = "gemini-3.1-flash-preview"
    model_embed: str = "gemini-embedding-001"

    # Agent Engine (set after first deploy)
    agent_engine_id: str | None = None

    # Cloud SQL
    db_instance: str = ""           # project:region:instance
    db_name: str = "tuna"
    db_user: str = "tuna-app"
    db_password_secret: str = "tuna-db-password"

    # Pub/Sub topics
    topic_currents_tick: str = "currents.tick"
    topic_replan_needed: str = "replan.needed"
    topic_notify_user: str = "notify.user"


settings = Settings()
