from __future__ import annotations

from contextlib import asynccontextmanager
from typing import TYPE_CHECKING, AsyncIterator

from playwright.async_api import Browser, Playwright, async_playwright

from app.core.config import settings
from app.scraper.errors import BrowserLaunchError

if TYPE_CHECKING:
    from playwright.async_api import BrowserContext, Page


@asynccontextmanager
async def browser_session() -> AsyncIterator[tuple[Playwright, Browser]]:
    """Launch Playwright and a Chromium browser, then tear down cleanly."""
    playwright: Playwright | None = None
    browser: Browser | None = None
    try:
        playwright = await async_playwright().start()
        try:
            browser = await playwright.chromium.launch(headless=settings.scraper_headless)
        except Exception as exc:
            raise BrowserLaunchError(f"Failed to launch Chromium: {exc}") from exc
        yield playwright, browser
    finally:
        if browser is not None:
            await browser.close()
        if playwright is not None:
            await playwright.stop()


@asynccontextmanager
async def page_session(
    browser: Browser,
    *,
    timeout_ms: int | None = None,
) -> AsyncIterator[Page]:
    """Open a fresh browser context and page with scraper defaults."""
    context: BrowserContext | None = None
    page: Page | None = None
    effective_timeout = timeout_ms or settings.scraper_timeout_ms
    try:
        context = await browser.new_context(
            user_agent=settings.scraper_user_agent,
            ignore_https_errors=False,
        )
        page = await context.new_page()
        page.set_default_timeout(effective_timeout)
        page.set_default_navigation_timeout(
            settings.scraper_navigation_timeout_ms,
        )
        yield page
    finally:
        if page is not None:
            await page.close()
        if context is not None:
            await context.close()
