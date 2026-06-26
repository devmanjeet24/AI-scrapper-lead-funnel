from __future__ import annotations

import random
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ai.deployment_agent import DeploymentAgent, MonitoringAgent
from app.ai.deployment_schemas import DeploymentPlanResult, MonitoringAnalysisResult
from app.core.config import settings
from app.models.deployment_monitor_snapshot import DeploymentMonitorSnapshot
from app.models.deployment_package import DeploymentPackage
from app.models.enums import DeploymentPackageStatus, MonitoringSnapshotSource
from app.services.deployment_adapters import get_deployment_adapter
from app.services.deployment_package_service import (
    DeploymentPackageNotFoundError,
    InvalidDeploymentPackageError,
    get_deployment_package,
)


class DeploymentAnalysisError(Exception):
    def __init__(self, message: str, code: str = "deployment_analysis_error") -> None:
        super().__init__(message)
        self.code = code


def _require_ai_enabled() -> None:
    if not settings.ai_enabled:
        raise DeploymentAnalysisError("AI is disabled", code="ai_disabled")
    if not settings.groq_api_key:
        raise DeploymentAnalysisError("GROQ_API_KEY is not configured", code="ai_not_configured")


async def analyze_deployment_package(
    db: Session,
    organization_id: uuid.UUID,
    package_id: uuid.UUID,
    *,
    requested_mode: str | None = None,
) -> DeploymentPackage:
    from app.models.enums import DeploymentMode

    _require_ai_enabled()
    package = get_deployment_package(db, organization_id, package_id)
    if package is None:
        raise DeploymentPackageNotFoundError

    mode = DeploymentMode(requested_mode) if requested_mode else DeploymentMode.export
    agent = DeploymentAgent()
    plan, usage = await agent.plan_deployment(
        payload=package.payload,
        channel_hint=package.channel_hint,
        requested_mode=mode,
    )

    package.agent_metadata = {
        "deployment_plan": plan.model_dump(mode="json"),
        "llm_usage": usage.model_dump(),
        "prompt_version": DeploymentAgent.prompt_version(),
        "analyzed_at": datetime.now(UTC).isoformat(),
        "requested_mode": mode.value,
    }
    db.commit()
    db.refresh(package)
    return package


async def execute_deployment_package_with_agent(
    db: Session,
    organization_id: uuid.UUID,
    package_id: uuid.UUID,
    *,
    mode: str | None = None,
    skip_analysis: bool = False,
) -> DeploymentPackage:
    from app.models.enums import DeploymentMode

    package = get_deployment_package(db, organization_id, package_id)
    if package is None:
        raise DeploymentPackageNotFoundError

    if package.status == DeploymentPackageStatus.deployed:
        return package

    if package.status != DeploymentPackageStatus.ready:
        raise InvalidDeploymentPackageError(
            f"Cannot execute deployment package with status '{package.status.value}'"
        )

    deployment_mode = DeploymentMode(mode) if mode else DeploymentMode.export
    plan: DeploymentPlanResult | None = None

    if not skip_analysis and settings.ai_enabled and settings.groq_api_key:
        existing_plan = (package.agent_metadata or {}).get("deployment_plan")
        if existing_plan:
            plan = DeploymentPlanResult.model_validate(existing_plan)
        else:
            agent = DeploymentAgent()
            plan, usage = await agent.plan_deployment(
                payload=package.payload,
                channel_hint=package.channel_hint,
                requested_mode=deployment_mode,
            )
            package.agent_metadata = {
                **(package.agent_metadata or {}),
                "deployment_plan": plan.model_dump(mode="json"),
                "llm_usage": usage.model_dump(),
                "prompt_version": DeploymentAgent.prompt_version(),
                "analyzed_at": datetime.now(UTC).isoformat(),
                "requested_mode": deployment_mode.value,
            }
        if plan and deployment_mode == DeploymentMode.export:
            deployment_mode = plan.recommended_mode

    adapter = get_deployment_adapter(deployment_mode)
    try:
        deploy_result = await adapter.deploy(package, plan)
        now = datetime.now(UTC)
        package.status = DeploymentPackageStatus.deployed
        package.deployed_at = now
        package.deploy_result = deploy_result
        package.error_message = None
    except Exception as exc:
        package.status = DeploymentPackageStatus.failed
        package.error_message = str(exc)
        db.commit()
        db.refresh(package)
        raise InvalidDeploymentPackageError(f"Deployment failed: {exc}") from exc

    db.commit()
    db.refresh(package)
    return package


def record_monitoring_snapshot(
    db: Session,
    organization_id: uuid.UUID,
    package_id: uuid.UUID,
    user_id: uuid.UUID,
    *,
    metrics: dict[str, Any],
    source: MonitoringSnapshotSource = MonitoringSnapshotSource.manual,
    recorded_at: datetime | None = None,
) -> DeploymentMonitorSnapshot:
    package = get_deployment_package(db, organization_id, package_id)
    if package is None:
        raise DeploymentPackageNotFoundError

    if package.status != DeploymentPackageStatus.deployed:
        raise InvalidDeploymentPackageError(
            "Monitoring snapshots can only be recorded for deployed packages"
        )

    snapshot = DeploymentMonitorSnapshot(
        organization_id=organization_id,
        deployment_package_id=package_id,
        recorded_by_id=user_id,
        recorded_at=recorded_at or datetime.now(UTC),
        source=source,
        metrics=metrics,
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


def simulate_monitoring_snapshot(
    db: Session,
    organization_id: uuid.UUID,
    package_id: uuid.UUID,
    user_id: uuid.UUID,
) -> DeploymentMonitorSnapshot:
    metrics = {
        "impressions": random.randint(500, 5000),
        "clicks": random.randint(10, 250),
        "spend": round(random.uniform(25.0, 350.0), 2),
        "conversions": random.randint(0, 15),
        "ctr": round(random.uniform(0.5, 4.5), 2),
        "cpc": round(random.uniform(0.5, 5.0), 2),
    }
    return record_monitoring_snapshot(
        db,
        organization_id,
        package_id,
        user_id,
        metrics=metrics,
        source=MonitoringSnapshotSource.simulated,
    )


def list_monitoring_snapshots(
    db: Session,
    organization_id: uuid.UUID,
    package_id: uuid.UUID,
    *,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[DeploymentMonitorSnapshot], int]:
    package = get_deployment_package(db, organization_id, package_id)
    if package is None:
        raise DeploymentPackageNotFoundError

    filters = [
        DeploymentMonitorSnapshot.organization_id == organization_id,
        DeploymentMonitorSnapshot.deployment_package_id == package_id,
    ]
    total = db.scalar(
        select(func.count()).select_from(DeploymentMonitorSnapshot).where(*filters)
    ) or 0
    snapshots = db.scalars(
        select(DeploymentMonitorSnapshot)
        .where(*filters)
        .order_by(DeploymentMonitorSnapshot.recorded_at.asc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(snapshots), total


async def run_monitoring_analysis(
    db: Session,
    organization_id: uuid.UUID,
    package_id: uuid.UUID,
) -> tuple[DeploymentPackage, MonitoringAnalysisResult]:
    _require_ai_enabled()
    package = get_deployment_package(db, organization_id, package_id)
    if package is None:
        raise DeploymentPackageNotFoundError

    if package.status != DeploymentPackageStatus.deployed:
        raise InvalidDeploymentPackageError(
            "Monitoring analysis requires a deployed package"
        )

    snapshots, _ = list_monitoring_snapshots(
        db, organization_id, package_id, limit=50, offset=0
    )
    if not snapshots:
        raise InvalidDeploymentPackageError(
            "At least one monitoring snapshot is required before analysis"
        )

    snapshot_payloads = [
        {
            "recorded_at": snap.recorded_at.isoformat(),
            "metrics": snap.metrics,
            "source": snap.source.value,
        }
        for snap in snapshots
    ]

    deploy_mode = (package.deploy_result or {}).get("mode", "export")
    agent = MonitoringAgent()
    analysis, usage = await agent.analyze_metrics(
        campaign_name=package.payload.get("campaign_name"),
        channel_hint=package.channel_hint,
        deployment_mode=deploy_mode,
        deployed_at=package.deployed_at.isoformat() if package.deployed_at else "N/A",
        snapshots=snapshot_payloads,
    )

    analysis_payload = {
        **analysis.model_dump(mode="json"),
        "llm_usage": usage.model_dump(),
        "prompt_version": MonitoringAgent.prompt_version(),
        "analyzed_at": datetime.now(UTC).isoformat(),
    }

    latest = snapshots[-1]
    latest.agent_analysis = analysis_payload

    package.agent_metadata = {
        **(package.agent_metadata or {}),
        "latest_monitoring_analysis": analysis_payload,
    }

    db.commit()
    db.refresh(package)
    return package, analysis
