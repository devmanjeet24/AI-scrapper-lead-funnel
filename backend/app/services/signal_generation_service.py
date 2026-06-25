from __future__ import annotations

import hashlib
import logging
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai import LLMError, PageAnalysisInput, PageAnalyzer
from app.core.config import settings
from app.models.enums import ScrapeResultStatus, SignalStatus
from app.models.scrape_job import ScrapeJob
from app.models.scrape_result import ScrapeResult
from app.models.signal import Signal

logger = logging.getLogger(__name__)


def is_ai_enabled() -> bool:
    return settings.ai_enabled and bool(settings.groq_api_key)


async def generate_signals_for_scrape_result(db: Session, result_id: uuid.UUID) -> int:
    """
    Run Groq page analysis on a successful scrape result and persist Signal rows.
    Returns the number of signals created. Never raises — failures are logged and
    recorded on the scrape result metadata.
    """
    if not is_ai_enabled():
        logger.info("AI analysis skipped for result %s (disabled or no API key)", result_id)
        return 0

    result = db.get(ScrapeResult, result_id)
    if result is None or result.status != ScrapeResultStatus.success:
        return 0

    job = db.scalar(select(ScrapeJob).where(ScrapeJob.id == result.job_id))
    if job is None:
        return 0

    extracted = result.extracted_data or {}
    headings = extracted.get("headings") or {}
    metadata = result.metadata_ or {}
    final_url = metadata.get("final_url") or job.target_url

    page_input = PageAnalysisInput(
        job_name=job.name,
        job_description=job.description,
        source_type=job.source_type.value,
        target_url=job.target_url,
        final_url=final_url,
        page_title=result.page_title or extracted.get("page_title"),
        meta_description=extracted.get("meta_description"),
        canonical_url=extracted.get("canonical_url"),
        headings_h1=headings.get("h1") or [],
        headings_h2=headings.get("h2") or [],
        visible_text_sample=extracted.get("visible_text_sample") or "",
    )

    analyzer = PageAnalyzer()
    try:
        analysis, usage = await analyzer.analyze(page_input)
        created = _persist_signals(
            db,
            organization_id=job.organization_id,
            job=job,
            result=result,
            analysis=analysis,
            usage=usage,
            prompt_version=analyzer.prompt_version(),
        )
        _record_ai_success(db, result, analysis, usage, created, analyzer.prompt_version())
        return created
    except LLMError as exc:
        logger.warning("AI analysis failed for result %s: %s", result_id, exc.message)
        _record_ai_failure(db, result, exc.message, exc.code)
        return 0
    except Exception:
        logger.exception("Unexpected AI analysis failure for result %s", result_id)
        _record_ai_failure(db, result, "Unexpected AI analysis failure", "llm_unexpected_error")
        return 0


def _persist_signals(
    db: Session,
    *,
    organization_id: uuid.UUID,
    job: ScrapeJob,
    result: ScrapeResult,
    analysis,
    usage,
    prompt_version: str,
) -> int:
    now = datetime.now(UTC)
    created = 0
    source_url = (result.metadata_ or {}).get("final_url") or job.target_url

    for detected in analysis.signals:
        fingerprint = _build_fingerprint(organization_id, source_url, detected.title)
        if _fingerprint_exists(db, organization_id, fingerprint):
            logger.info("Duplicate signal skipped fingerprint=%s", fingerprint)
            continue

        signal = Signal(
            organization_id=organization_id,
            scrape_job_id=job.id,
            scrape_result_id=result.id,
            signal_type=detected.signal_type,
            source_type=job.source_type,
            title=detected.title,
            summary=detected.summary,
            raw_snippet=detected.raw_snippet,
            source_url=source_url,
            source_label=job.name,
            extracted_data={
                "lead_score": detected.lead_score,
                "recommendation": detected.recommendation,
                "page_summary": analysis.page_summary,
                "overall_lead_score": analysis.overall_lead_score,
            },
            confidence_score=detected.confidence_score,
            fingerprint=fingerprint,
            status=SignalStatus.new,
            priority=detected.priority,
            extraction_model=usage.model,
            agent_metadata={
                "prompt_version": prompt_version,
                "provider": "groq",
                "usage": {
                    "prompt_tokens": usage.prompt_tokens,
                    "completion_tokens": usage.completion_tokens,
                    "total_tokens": usage.total_tokens,
                    "duration_ms": usage.duration_ms,
                },
            },
            detected_at=now,
        )
        db.add(signal)
        created += 1

    db.commit()
    return created


def _fingerprint_exists(
    db: Session,
    organization_id: uuid.UUID,
    fingerprint: str,
) -> bool:
    existing = db.scalar(
        select(Signal.id).where(
            Signal.organization_id == organization_id,
            Signal.fingerprint == fingerprint,
        )
    )
    return existing is not None


def _build_fingerprint(organization_id: uuid.UUID, source_url: str, title: str) -> str:
    raw = f"{organization_id}:{source_url}:{title.lower().strip()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:64]


def _record_ai_success(
    db: Session,
    result: ScrapeResult,
    analysis,
    usage,
    signals_created: int,
    prompt_version: str,
) -> None:
    metadata: dict[str, Any] = dict(result.metadata_ or {})
    metadata["ai_analysis"] = {
        "status": "success",
        "provider": "groq",
        "model": usage.model,
        "prompt_version": prompt_version,
        "page_summary": analysis.page_summary,
        "overall_lead_score": analysis.overall_lead_score,
        "signals_created": signals_created,
        "signals_detected": len(analysis.signals),
        "usage": {
            "prompt_tokens": usage.prompt_tokens,
            "completion_tokens": usage.completion_tokens,
            "total_tokens": usage.total_tokens,
            "duration_ms": usage.duration_ms,
        },
    }
    result.metadata_ = metadata
    db.commit()


def _record_ai_failure(
    db: Session,
    result: ScrapeResult,
    message: str,
    error_code: str,
) -> None:
    metadata: dict[str, Any] = dict(result.metadata_ or {})
    metadata["ai_analysis"] = {
        "status": "failed",
        "provider": "groq",
        "error_code": error_code,
        "error_message": message,
    }
    result.metadata_ = metadata
    db.commit()
