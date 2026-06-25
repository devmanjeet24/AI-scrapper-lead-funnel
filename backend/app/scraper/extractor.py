from __future__ import annotations

import re
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup

from app.core.config import settings
from app.scraper.types import ExtractionResult


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _unique_nonempty(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        normalized = _normalize_text(value)
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        result.append(normalized)
    return result


def _extract_visible_text(soup: BeautifulSoup) -> str:
    for tag in soup(["script", "style", "noscript", "template"]):
        tag.decompose()

    text = soup.get_text(separator=" ", strip=True)
    normalized = _normalize_text(text)
    max_chars = settings.scraper_visible_text_max_chars
    if len(normalized) <= max_chars:
        return normalized
    return normalized[:max_chars].rstrip() + "…"


def extract_from_html(html: str, *, base_url: str | None = None) -> ExtractionResult:
    """Parse rendered HTML and return structured extraction output."""
    soup = BeautifulSoup(html, "html.parser")

    title_tag = soup.find("title")
    page_title = _normalize_text(title_tag.get_text()) if title_tag else None

    description_tag = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
    meta_description = None
    if description_tag and description_tag.get("content"):
        meta_description = _normalize_text(str(description_tag["content"]))

    canonical_tag = soup.find("link", rel=lambda value: value and "canonical" in value)
    canonical_url = None
    if canonical_tag and canonical_tag.get("href"):
        href = str(canonical_tag["href"]).strip()
        if base_url:
            canonical_url = urljoin(base_url, href)
        else:
            canonical_url = href

    headings_h1 = _unique_nonempty(
        [_normalize_text(tag.get_text()) for tag in soup.find_all("h1")]
    )
    headings_h2 = _unique_nonempty(
        [_normalize_text(tag.get_text()) for tag in soup.find_all("h2")]
    )

    visible_text_sample = _extract_visible_text(soup)

    return ExtractionResult(
        page_title=page_title,
        meta_description=meta_description,
        canonical_url=canonical_url,
        headings_h1=headings_h1,
        headings_h2=headings_h2,
        visible_text_sample=visible_text_sample,
    )


def validate_target_url(url: str) -> str:
    """Validate that a URL is suitable for Playwright navigation."""
    parsed = urlparse(url.strip())
    if parsed.scheme not in {"http", "https"}:
        raise ValueError("URL must use http or https scheme")
    if not parsed.netloc:
        raise ValueError("URL must include a hostname")
    return url.strip()
