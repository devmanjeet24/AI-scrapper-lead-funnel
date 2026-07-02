from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ — folder that contains app/ and .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    frontend_url: str = "http://localhost:5173"
    app_env: str = "development"
    debug: bool = False

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    # Scraper / Playwright
    scraper_timeout_ms: int = 30_000
    scraper_navigation_timeout_ms: int = 30_000
    scraper_headless: bool = True
    scraper_wait_until: str = "domcontentloaded"
    scraper_visible_text_max_chars: int = 2_000
    scraper_user_agent: str = (
        "Mozilla/5.0 (compatible; AIScraperLeadFunnel/0.1; +https://example.com/bot)"
    )

    # AI / Groq (post-scrape intelligence only)
    groq_api_key: str | None = None
    ai_enabled: bool = True
    groq_model: str = "llama-3.3-70b-versatile"
    groq_max_tokens: int = 2_048
    groq_temperature: float = 0.2
    groq_timeout_seconds: float = 60.0
    groq_max_retries: int = 2
    groq_max_requests_per_minute: int = 30
    ai_max_input_chars: int = 6_000
    ai_max_signals_per_page: int = 5

    # Optional ad platform credentials (Phase 5 — not required for prototype)
    facebook_ads_access_token: str | None = None
    google_ads_developer_token: str | None = None
    linkedin_ads_access_token: str | None = None

    # Optional outreach credentials (Phase 6 — not required for prototype)
    resend_api_key: str | None = None
    resend_from_email: str = "onboarding@resend.dev"
    resend_reply_to: str | None = None
    retell_api_key: str | None = None
    vapi_api_key: str | None = None

    # Google Calendar / OAuth (Phase 7)
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_redirect_uri: str = "http://localhost:8000/integrations/google-calendar/callback"
    google_calendar_id: str = "primary"
    google_oauth_encryption_key: str | None = None
    appointment_default_duration_minutes: int = 30
    appointment_slot_buffer_minutes: int = 15
    appointment_booking_horizon_days: int = 14
    sales_team_email: str | None = None
    sales_handoff_webhook_url: str | None = None


settings = Settings()
