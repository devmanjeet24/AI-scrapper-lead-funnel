from __future__ import annotations

import time
from typing import Any

from playwright.async_api import Error as PlaywrightError
from playwright.async_api import TimeoutError as PlaywrightTimeoutError

from app.core.config import settings
from app.scraper.browser import browser_session, page_session
from app.scraper.errors import (
    BrowserLaunchError,
    InvalidUrlError,
    NetworkError,
    ScraperTimeoutError,
)
from app.scraper.extractor import extract_from_html, validate_target_url
from app.scraper.types import ScrapeOutput


class PlaywrightScraper:
    """Headless Chromium scraper for single-page web captures."""

    async def scrape(self, target_url: str) -> ScrapeOutput:
        started = time.perf_counter()

        try:
            normalized_url = validate_target_url(target_url)
        except ValueError as exc:
            raise InvalidUrlError(str(exc)) from exc

        try:
            async with browser_session() as (_, browser):
                async with page_session(browser) as page:
                    response = await page.goto(
                        normalized_url,
                        wait_until=settings.scraper_wait_until,
                        timeout=settings.scraper_navigation_timeout_ms,
                    )

                    raw_html = await page.content()
                    live_title = await page.title()
                    final_url = page.url

                    extraction = extract_from_html(raw_html, base_url=final_url)
                    if live_title and not extraction.page_title:
                        extraction.page_title = live_title.strip() or None

                    metadata = self._build_metadata(
                        started_at=started,
                        final_url=final_url,
                        response_status=response.status if response else None,
                        response_headers=dict(response.headers) if response else {},
                        html_bytes=len(raw_html.encode("utf-8")),
                    )

                    return ScrapeOutput(
                        target_url=normalized_url,
                        final_url=final_url,
                        page_title=extraction.page_title,
                        raw_html=raw_html,
                        extraction=extraction,
                        metadata=metadata,
                    )
        except InvalidUrlError:
            raise
        except BrowserLaunchError:
            raise
        except PlaywrightTimeoutError as exc:
            raise ScraperTimeoutError(
                f"Navigation timed out after {settings.scraper_navigation_timeout_ms}ms"
            ) from exc
        except PlaywrightError as exc:
            message = str(exc)
            if "net::" in message or "NS_ERROR" in message:
                raise NetworkError(message) from exc
            raise NetworkError(message) from exc
        except Exception as exc:
            raise NetworkError(f"Unexpected scraper failure: {exc}") from exc

    def _build_metadata(
        self,
        *,
        started_at: float,
        final_url: str,
        response_status: int | None,
        response_headers: dict[str, str],
        html_bytes: int,
    ) -> dict[str, Any]:
        duration_ms = int((time.perf_counter() - started_at) * 1000)
        return {
            "engine": "playwright",
            "browser": "chromium",
            "headless": settings.scraper_headless,
            "wait_until": settings.scraper_wait_until,
            "final_url": final_url,
            "response_status": response_status,
            "response_content_type": response_headers.get("content-type"),
            "duration_ms": duration_ms,
            "html_bytes": html_bytes,
        }
