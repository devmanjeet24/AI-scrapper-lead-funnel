from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.ai import LLMError, CreativeGenerator
from app.core.config import settings
from app.models.creative_asset import CreativeAsset
from app.models.creative_set import CreativeSet
from app.models.enums import CreativeAssetStatus, CreativeSetStatus, LeadStatus
from app.models.lead import Lead
from app.schemas.creative import CreativeGenerateRequest
from app.services.creative_generation_service import build_creative_input, persist_creative_assets
from app.services.lead_service import LeadNotFoundError, get_lead

logger = logging.getLogger(__name__)


class CreativeSetNotFoundError(Exception):
    pass


class CreativeAssetNotFoundError(Exception):
    pass


class CreativeGenerationError(Exception):
    def __init__(self, message: str, code: str = "generation_failed") -> None:
        super().__init__(message)
        self.code = code


class InvalidCreativeUpdateError(Exception):
    pass


def is_ai_enabled() -> bool:
    return settings.ai_enabled and bool(settings.groq_api_key)


async def generate_creatives_for_lead(
    db: Session,
    organization_id: uuid.UUID,
    lead_id: uuid.UUID,
    user_id: uuid.UUID,
    params: CreativeGenerateRequest,
) -> CreativeSet:
    if not is_ai_enabled():
        raise CreativeGenerationError("AI is disabled or GROQ_API_KEY is not set", "ai_disabled")

    lead = get_lead(db, organization_id, lead_id)
    if lead is None:
        raise LeadNotFoundError
    if lead.status == LeadStatus.archived:
        raise InvalidCreativeUpdateError("Cannot generate creatives for an archived lead")

    creative_set = CreativeSet(
        organization_id=organization_id,
        lead_id=lead.id,
        created_by_id=user_id,
        signal_id=lead.signal_id,
        scrape_job_id=lead.scrape_job_id,
        scrape_result_id=lead.scrape_result_id,
        status=CreativeSetStatus.generating,
        generation_params=params.model_dump(),
    )
    db.add(creative_set)
    db.commit()
    db.refresh(creative_set)

    generator = CreativeGenerator()
    try:
        creative_input = build_creative_input(db, lead)
        result, usage = await generator.generate(
            creative_input,
            max_headlines=params.max_headlines,
            max_ad_copy=params.max_ad_copy_variants,
        )

        creative_set.campaign_name = result.campaign_name
        creative_set.campaign_objective = result.campaign_objective
        creative_set.extraction_model = usage.model
        creative_set.agent_metadata = {
            "prompt_version": generator.prompt_version(),
            "provider": "groq",
            "usage": {
                "prompt_tokens": usage.prompt_tokens,
                "completion_tokens": usage.completion_tokens,
                "total_tokens": usage.total_tokens,
                "duration_ms": usage.duration_ms,
            },
        }
        creative_set.status = CreativeSetStatus.completed

        persist_creative_assets(
            db,
            organization_id=organization_id,
            creative_set_id=creative_set.id,
            result=result,
        )
        db.commit()
        db.refresh(creative_set)
        return creative_set

    except LLMError as exc:
        logger.warning("Creative generation failed for lead %s: %s", lead_id, exc.message)
        creative_set.status = CreativeSetStatus.failed
        creative_set.error_message = exc.message
        db.commit()
        db.refresh(creative_set)
        raise CreativeGenerationError(exc.message, exc.code) from exc
    except Exception:
        logger.exception("Unexpected creative generation failure for lead %s", lead_id)
        creative_set.status = CreativeSetStatus.failed
        creative_set.error_message = "Unexpected creative generation failure"
        db.commit()
        db.refresh(creative_set)
        raise


def list_creative_sets_for_lead(
    db: Session,
    organization_id: uuid.UUID,
    lead_id: uuid.UUID,
    *,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[CreativeSet], int]:
    filters = [
        CreativeSet.organization_id == organization_id,
        CreativeSet.lead_id == lead_id,
    ]
    total = db.scalar(select(func.count()).select_from(CreativeSet).where(*filters)) or 0
    sets = db.scalars(
        select(CreativeSet)
        .where(*filters)
        .options(selectinload(CreativeSet.assets))
        .order_by(CreativeSet.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(sets), total


def get_creative_set(
    db: Session,
    organization_id: uuid.UUID,
    creative_set_id: uuid.UUID,
) -> CreativeSet | None:
    return db.scalar(
        select(CreativeSet)
        .where(
            CreativeSet.id == creative_set_id,
            CreativeSet.organization_id == organization_id,
        )
        .options(selectinload(CreativeSet.assets))
    )


def list_creative_assets(
    db: Session,
    organization_id: uuid.UUID,
    *,
    creative_set_id: uuid.UUID | None = None,
    lead_id: uuid.UUID | None = None,
    status: CreativeAssetStatus | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[CreativeAsset], int]:
    filters = [CreativeAsset.organization_id == organization_id]

    if creative_set_id is not None:
        filters.append(CreativeAsset.creative_set_id == creative_set_id)
    if status is not None:
        filters.append(CreativeAsset.status == status)
    if lead_id is not None:
        filters.append(
            CreativeAsset.creative_set_id.in_(
                select(CreativeSet.id).where(
                    CreativeSet.organization_id == organization_id,
                    CreativeSet.lead_id == lead_id,
                )
            )
        )

    total = db.scalar(select(func.count()).select_from(CreativeAsset).where(*filters)) or 0
    assets = db.scalars(
        select(CreativeAsset)
        .where(*filters)
        .order_by(CreativeAsset.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(assets), total


def get_creative_asset(
    db: Session,
    organization_id: uuid.UUID,
    asset_id: uuid.UUID,
) -> CreativeAsset | None:
    return db.scalar(
        select(CreativeAsset).where(
            CreativeAsset.id == asset_id,
            CreativeAsset.organization_id == organization_id,
        )
    )


def update_creative_asset(
    db: Session,
    organization_id: uuid.UUID,
    asset_id: uuid.UUID,
    user_id: uuid.UUID,
    *,
    status: CreativeAssetStatus | None = None,
    rejection_reason: str | None = None,
) -> CreativeAsset:
    asset = get_creative_asset(db, organization_id, asset_id)
    if asset is None:
        raise CreativeAssetNotFoundError

    if status is None:
        return asset

    now = datetime.now(UTC)

    if status == CreativeAssetStatus.rejected:
        if not rejection_reason:
            raise InvalidCreativeUpdateError(
                "rejection_reason is required when status is rejected"
            )
        asset.rejection_reason = rejection_reason
    else:
        asset.rejection_reason = None

    asset.status = status
    asset.reviewed_by_id = user_id
    asset.reviewed_at = now

    db.commit()
    db.refresh(asset)
    return asset
