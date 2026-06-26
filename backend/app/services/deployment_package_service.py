from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.creative_asset import CreativeAsset
from app.models.creative_set import CreativeSet
from app.models.deployment_package import DeploymentPackage
from app.models.enums import (
    CreativeAssetStatus,
    CreativeAssetType,
    CreativeSetStatus,
    DeploymentPackageStatus,
)
from app.models.lead import Lead
from app.schemas.deployment import DeploymentPackageCreate


class DeploymentPackageNotFoundError(Exception):
    pass


class InvalidDeploymentPackageError(Exception):
    pass


def _asset_payload(asset: CreativeAsset) -> dict[str, Any]:
    return {
        "id": str(asset.id),
        "asset_type": asset.asset_type.value,
        "title": asset.title,
        "content": asset.content,
        "body_text": asset.body_text,
        "sort_order": asset.sort_order,
    }


def _infer_channel_hint(assets: list[CreativeAsset]) -> str | None:
    for asset in assets:
        if asset.asset_type == CreativeAssetType.campaign_idea:
            channel = asset.content.get("channel_hint")
            if channel:
                return str(channel)
    return None


def build_deployment_payload(
    *,
    creative_set: CreativeSet,
    lead: Lead,
    approved_assets: list[CreativeAsset],
    channel_hint: str | None,
    prepared_by_id: uuid.UUID,
) -> dict[str, Any]:
    headlines = [
        _asset_payload(a) for a in approved_assets if a.asset_type == CreativeAssetType.headline
    ]
    ad_copy = [
        _asset_payload(a) for a in approved_assets if a.asset_type == CreativeAssetType.ad_copy
    ]
    campaign_ideas = [
        _asset_payload(a) for a in approved_assets if a.asset_type == CreativeAssetType.campaign_idea
    ]
    targeting = [
        _asset_payload(a)
        for a in approved_assets
        if a.asset_type == CreativeAssetType.targeting_suggestion
    ]

    return {
        "creative_set_id": str(creative_set.id),
        "lead_id": str(lead.id),
        "campaign_name": creative_set.campaign_name,
        "campaign_objective": creative_set.campaign_objective,
        "channel_hint": channel_hint,
        "lead_context": {
            "title": lead.title,
            "summary": lead.summary,
            "source_url": lead.source_url,
            "source_label": lead.source_label,
            "lead_score": lead.lead_score,
            "recommendation": lead.recommendation,
            "priority": lead.priority.value if lead.priority else None,
        },
        "assets": {
            "headlines": headlines,
            "ad_copy": ad_copy,
            "campaign_ideas": campaign_ideas,
            "targeting": targeting,
        },
        "prepared_at": datetime.now(UTC).isoformat(),
        "prepared_by_id": str(prepared_by_id),
    }


def _get_creative_set(
    db: Session,
    organization_id: uuid.UUID,
    creative_set_id: uuid.UUID,
) -> CreativeSet | None:
    return db.scalar(
        select(CreativeSet).where(
            CreativeSet.id == creative_set_id,
            CreativeSet.organization_id == organization_id,
        )
    )


def _get_approved_assets(db: Session, creative_set_id: uuid.UUID) -> list[CreativeAsset]:
    return list(
        db.scalars(
            select(CreativeAsset)
            .where(
                CreativeAsset.creative_set_id == creative_set_id,
                CreativeAsset.status == CreativeAssetStatus.approved,
            )
            .order_by(CreativeAsset.sort_order)
        ).all()
    )


def _validate_deployable_assets(approved_assets: list[CreativeAsset]) -> None:
    headline_count = sum(
        1 for a in approved_assets if a.asset_type == CreativeAssetType.headline
    )
    ad_copy_count = sum(
        1 for a in approved_assets if a.asset_type == CreativeAssetType.ad_copy
    )
    if headline_count < 1:
        raise InvalidDeploymentPackageError(
            "At least one approved headline is required to create a deployment package"
        )
    if ad_copy_count < 1:
        raise InvalidDeploymentPackageError(
            "At least one approved ad copy variant is required to create a deployment package"
        )


def prepare_deployment_package(
    db: Session,
    organization_id: uuid.UUID,
    creative_set_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: DeploymentPackageCreate,
) -> DeploymentPackage:
    creative_set = _get_creative_set(db, organization_id, creative_set_id)
    if creative_set is None:
        raise DeploymentPackageNotFoundError

    if creative_set.status != CreativeSetStatus.completed:
        raise InvalidDeploymentPackageError(
            "Deployment package can only be created from a completed creative set"
        )

    existing = db.scalar(
        select(DeploymentPackage.id).where(
            DeploymentPackage.creative_set_id == creative_set_id,
        )
    )
    if existing is not None:
        raise InvalidDeploymentPackageError(
            "A deployment package already exists for this creative set"
        )

    lead = db.scalar(
        select(Lead).where(
            Lead.id == creative_set.lead_id,
            Lead.organization_id == organization_id,
        )
    )
    if lead is None:
        raise DeploymentPackageNotFoundError

    approved_assets = _get_approved_assets(db, creative_set_id)
    _validate_deployable_assets(approved_assets)

    channel_hint = payload.channel_hint or _infer_channel_hint(approved_assets)
    package_payload = build_deployment_payload(
        creative_set=creative_set,
        lead=lead,
        approved_assets=approved_assets,
        channel_hint=channel_hint,
        prepared_by_id=user_id,
    )

    package = DeploymentPackage(
        organization_id=organization_id,
        creative_set_id=creative_set_id,
        lead_id=lead.id,
        created_by_id=user_id,
        status=DeploymentPackageStatus.ready,
        channel_hint=channel_hint,
        payload=package_payload,
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    return package


def get_deployment_package(
    db: Session,
    organization_id: uuid.UUID,
    package_id: uuid.UUID,
) -> DeploymentPackage | None:
    return db.scalar(
        select(DeploymentPackage).where(
            DeploymentPackage.id == package_id,
            DeploymentPackage.organization_id == organization_id,
        )
    )


def list_deployment_packages(
    db: Session,
    organization_id: uuid.UUID,
    *,
    lead_id: uuid.UUID | None = None,
    status: DeploymentPackageStatus | None = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[DeploymentPackage], int]:
    filters = [DeploymentPackage.organization_id == organization_id]

    if lead_id is not None:
        filters.append(DeploymentPackage.lead_id == lead_id)
    if status is not None:
        filters.append(DeploymentPackage.status == status)

    total = db.scalar(select(func.count()).select_from(DeploymentPackage).where(*filters)) or 0
    packages = db.scalars(
        select(DeploymentPackage)
        .where(*filters)
        .order_by(DeploymentPackage.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(packages), total


async def execute_deployment_package(
    db: Session,
    organization_id: uuid.UUID,
    package_id: uuid.UUID,
    *,
    mode: str | None = None,
) -> DeploymentPackage:
    """Execute deployment — delegates to Agent 2 when AI is enabled."""
    from app.services.deployment_monitoring_service import execute_deployment_package_with_agent

    return await execute_deployment_package_with_agent(
        db,
        organization_id,
        package_id,
        mode=mode,
    )
