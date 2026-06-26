from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.ai.creative_schemas import CreativeGenerationInput
from app.models.lead import Lead
from app.models.scrape_job import ScrapeJob
from app.models.scrape_result import ScrapeResult
from app.models.signal import Signal


def build_creative_input(
    db: Session,
    lead: Lead,
) -> CreativeGenerationInput:
    signal: Signal | None = None
    if lead.signal_id:
        signal = db.get(Signal, lead.signal_id)

    scrape_result: ScrapeResult | None = None
    if lead.scrape_result_id:
        scrape_result = db.get(ScrapeResult, lead.scrape_result_id)

    scrape_job: ScrapeJob | None = None
    if lead.scrape_job_id:
        scrape_job = db.get(ScrapeJob, lead.scrape_job_id)

    extracted = lead.extracted_data or {}
    page_summary = extracted.get("page_summary")

    headings_h1: list[str] = []
    headings_h2: list[str] = []
    meta_description: str | None = None
    visible_text_sample = ""
    page_title = lead.title

    if scrape_result:
        result_extracted = scrape_result.extracted_data or {}
        headings = result_extracted.get("headings") or {}
        headings_h1 = headings.get("h1") or []
        headings_h2 = headings.get("h2") or []
        meta_description = result_extracted.get("meta_description")
        visible_text_sample = result_extracted.get("visible_text_sample") or ""
        page_title = scrape_result.page_title or result_extracted.get("page_title") or page_title

        metadata = scrape_result.metadata_ or {}
        ai_analysis = metadata.get("ai_analysis") or {}
        if not page_summary:
            page_summary = ai_analysis.get("page_summary")

    return CreativeGenerationInput(
        lead_title=lead.title,
        lead_summary=lead.summary,
        lead_recommendation=lead.recommendation,
        lead_score=lead.lead_score,
        lead_priority=lead.priority.value if lead.priority else None,
        lead_notes=lead.notes,
        source_url=lead.source_url,
        source_label=lead.source_label,
        signal_type=signal.signal_type.value if signal else None,
        source_type=signal.source_type.value if signal else (
            scrape_job.source_type.value if scrape_job else None
        ),
        job_name=scrape_job.name if scrape_job else None,
        job_description=scrape_job.description if scrape_job else None,
        page_title=page_title,
        meta_description=meta_description,
        headings_h1=headings_h1,
        headings_h2=headings_h2,
        visible_text_sample=visible_text_sample,
        page_summary=page_summary,
    )


def persist_creative_assets(
    db: Session,
    *,
    organization_id: uuid.UUID,
    creative_set_id: uuid.UUID,
    result: Any,
) -> int:
    from app.models.creative_asset import CreativeAsset
    from app.models.enums import CreativeAssetStatus, CreativeAssetType

    sort_order = 0
    created = 0

    for headline in result.headlines:
        db.add(
            CreativeAsset(
                organization_id=organization_id,
                creative_set_id=creative_set_id,
                asset_type=CreativeAssetType.headline,
                title=headline[:200] if len(headline) > 200 else headline,
                content={"text": headline},
                body_text=headline,
                sort_order=sort_order,
                status=CreativeAssetStatus.draft,
            )
        )
        sort_order += 1
        created += 1

    for variant in result.ad_copy_variants:
        body = variant.primary_text
        db.add(
            CreativeAsset(
                organization_id=organization_id,
                creative_set_id=creative_set_id,
                asset_type=CreativeAssetType.ad_copy,
                title=variant.headline,
                content=variant.model_dump(),
                body_text=body,
                sort_order=sort_order,
                status=CreativeAssetStatus.draft,
            )
        )
        sort_order += 1
        created += 1

    for idea in result.campaign_ideas:
        db.add(
            CreativeAsset(
                organization_id=organization_id,
                creative_set_id=creative_set_id,
                asset_type=CreativeAssetType.campaign_idea,
                title=idea.title,
                content=idea.model_dump(),
                body_text=idea.description,
                sort_order=sort_order,
                status=CreativeAssetStatus.draft,
            )
        )
        sort_order += 1
        created += 1

    for targeting in result.targeting_suggestions:
        db.add(
            CreativeAsset(
                organization_id=organization_id,
                creative_set_id=creative_set_id,
                asset_type=CreativeAssetType.targeting_suggestion,
                title=targeting.audience_name,
                content=targeting.model_dump(),
                body_text=targeting.rationale,
                sort_order=sort_order,
                status=CreativeAssetStatus.draft,
            )
        )
        sort_order += 1
        created += 1

    return created
