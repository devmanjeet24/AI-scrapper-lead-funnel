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
    app_env: str = "development"
    debug: bool = False

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


settings = Settings()
