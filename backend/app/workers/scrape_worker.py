from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.enums import ScrapeResultStatus
from app.models.scrape_job import ScrapeJob
from app.models.scrape_result import ScrapeResult
from app.scraper import PlaywrightScraper
from app.scraper.errors import ScraperError
from app.scraper.types import ScrapeOutput
from app.services.signal_generation_service import generate_signals_for_scrape_result

logger = logging.getLogger(__name__)


def execute_scrape_run(result_id: uuid.UUID) -> None:
    """Entry point for background scrape execution."""
    asyncio.run(_execute_scrape_run_async(result_id))


async def _execute_scrape_run_async(result_id: uuid.UUID) -> None:
    db = SessionLocal()
    try:
        result = db.get(ScrapeResult, result_id)
        if result is None:
            logger.error("Scrape result %s not found", result_id)
            return

        if result.status != ScrapeResultStatus.pending:
            logger.warning(
                "Scrape result %s skipped; expected pending, got %s",
                result_id,
                result.status,
            )
            return

        job = db.scalar(select(ScrapeJob).where(ScrapeJob.id == result.job_id))
        if job is None:
            _mark_failed(db, result, "Associated scrape job not found")
            return

        _mark_running(db, result, job)

        scraper = PlaywrightScraper()
        try:
            output = await scraper.scrape(job.target_url)
            _mark_success(db, result, job, output)
            signal_count = await generate_signals_for_scrape_result(db, result.id)
            if signal_count:
                logger.info(
                    "AI analysis created %s signal(s) for scrape result %s",
                    signal_count,
                    result.id,
                )
        except ScraperError as exc:
            _mark_failed(db, result, exc.message, error_code=exc.code)
        except Exception as exc:
            logger.exception("Unexpected failure during scrape run %s", result_id)
            _mark_failed(db, result, f"Unexpected scraper failure: {exc}")
    finally:
        db.close()


def _mark_running(db: Session, result: ScrapeResult, job: ScrapeJob) -> None:
    now = datetime.now(UTC)
    result.status = ScrapeResultStatus.running
    result.started_at = now
    job.last_run_at = now
    db.commit()


def _mark_success(
    db: Session,
    result: ScrapeResult,
    job: ScrapeJob,
    output: ScrapeOutput,
) -> None:
    now = datetime.now(UTC)
    extraction = output.extraction

    result.status = ScrapeResultStatus.success
    result.finished_at = now
    result.page_title = output.page_title
    result.raw_html = output.raw_html
    result.extracted_data = extraction.to_dict()
    result.metadata_ = output.metadata
    result.items_count = len(extraction.headings_h1) + len(extraction.headings_h2)
    result.summary = _build_summary(extraction)
    result.error_message = None
    job.last_run_at = now

    db.commit()
    logger.info("Scrape run %s completed successfully for job %s", result.id, job.id)


def _mark_failed(
    db: Session,
    result: ScrapeResult,
    message: str,
    *,
    error_code: str | None = None,
) -> None:
    now = datetime.now(UTC)
    result.status = ScrapeResultStatus.failed
    result.finished_at = now
    result.error_message = message
    result.summary = None
    if error_code:
        result.metadata_ = {"error_code": error_code}
    db.commit()
    logger.warning("Scrape run %s failed: %s", result.id, message)


def _build_summary(extraction) -> str:
    parts: list[str] = []
    if extraction.page_title:
        parts.append(f"Title: {extraction.page_title}")
    if extraction.meta_description:
        parts.append(f"Description: {extraction.meta_description[:160]}")
    parts.append(f"H1 count: {len(extraction.headings_h1)}")
    parts.append(f"H2 count: {len(extraction.headings_h2)}")
    return " | ".join(parts)
