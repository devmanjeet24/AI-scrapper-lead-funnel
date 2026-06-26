from __future__ import annotations

import json
import logging
from typing import Any

from app.ai.deployment_prompts import (
    MONITORING_PROMPT_VERSION,
    PROMPT_VERSION,
    build_deployment_system_prompt,
    build_deployment_user_prompt,
    build_monitoring_system_prompt,
    build_monitoring_user_prompt,
)
from app.ai.deployment_schemas import DeploymentPlanResult, MonitoringAnalysisResult
from app.ai.groq_client import GroqClient
from app.ai.schemas import LLMUsage
from app.core.config import settings
from app.models.enums import DeploymentMode

logger = logging.getLogger(__name__)


def _sample_assets(assets: list[dict[str, Any]], limit: int = 3) -> str:
    samples = []
    for asset in assets[:limit]:
        text = asset.get("body_text") or asset.get("title") or str(asset.get("content", ""))
        samples.append(str(text)[:200])
    return " | ".join(samples) if samples else ""


def _platforms_available() -> str:
    platforms = []
    if settings.facebook_ads_access_token:
        platforms.append("facebook_ads")
    if settings.google_ads_developer_token:
        platforms.append("google_ads")
    if settings.linkedin_ads_access_token:
        platforms.append("linkedin_ads")
    return ", ".join(platforms) if platforms else "none (export only)"


class DeploymentAgent:
    """LLM Agent 2 — plans deployment from an approved package payload."""

    async def plan_deployment(
        self,
        *,
        payload: dict[str, Any],
        channel_hint: str | None,
        requested_mode: DeploymentMode = DeploymentMode.export,
    ) -> tuple[DeploymentPlanResult, LLMUsage]:
        assets = payload.get("assets", {})
        headlines = assets.get("headlines", [])
        ad_copy = assets.get("ad_copy", [])
        ideas = assets.get("campaign_ideas", [])
        targeting = assets.get("targeting", [])
        lead_context = payload.get("lead_context", {})

        system_prompt = build_deployment_system_prompt()
        user_prompt = build_deployment_user_prompt(
            campaign_name=payload.get("campaign_name"),
            campaign_objective=payload.get("campaign_objective"),
            channel_hint=channel_hint or payload.get("channel_hint"),
            requested_mode=requested_mode.value,
            platforms_available=_platforms_available(),
            lead_title=lead_context.get("title"),
            lead_summary=lead_context.get("summary"),
            lead_score=lead_context.get("lead_score"),
            lead_priority=lead_context.get("priority"),
            lead_recommendation=lead_context.get("recommendation"),
            headline_count=len(headlines),
            headline_samples=_sample_assets(headlines),
            ad_copy_count=len(ad_copy),
            ad_copy_samples=_sample_assets(ad_copy),
            idea_count=len(ideas),
            idea_samples=_sample_assets(ideas),
            targeting_count=len(targeting),
            targeting_samples=_sample_assets(targeting),
        )

        client = GroqClient()
        result, usage = await client.analyze_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=DeploymentPlanResult,
        )

        logger.info(
            "Deployment plan complete model=%s mode=%s readiness=%s",
            usage.model,
            result.recommended_mode.value,
            result.readiness_score,
        )
        return result, usage

    @staticmethod
    def prompt_version() -> str:
        return PROMPT_VERSION


class MonitoringAgent:
    """LLM Agent 2 monitoring — analyzes metrics snapshots and recommends actions."""

    async def analyze_metrics(
        self,
        *,
        campaign_name: str | None,
        channel_hint: str | None,
        deployment_mode: str,
        deployed_at: str,
        snapshots: list[dict[str, Any]],
    ) -> tuple[MonitoringAnalysisResult, LLMUsage]:
        if not snapshots:
            raise ValueError("At least one metrics snapshot is required for monitoring analysis")

        history_lines = []
        for snap in snapshots:
            history_lines.append(
                f"- {snap.get('recorded_at')}: {json.dumps(snap.get('metrics', {}), default=str)}"
            )

        latest = snapshots[-1]
        system_prompt = build_monitoring_system_prompt()
        user_prompt = build_monitoring_user_prompt(
            campaign_name=campaign_name,
            channel_hint=channel_hint,
            deployment_mode=deployment_mode,
            deployed_at=deployed_at,
            metrics_history="\n".join(history_lines),
            latest_metrics=json.dumps(latest.get("metrics", {}), default=str),
        )

        client = GroqClient()
        result, usage = await client.analyze_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=MonitoringAnalysisResult,
        )

        logger.info(
            "Monitoring analysis complete model=%s recommendation=%s health=%s",
            usage.model,
            result.recommendation.value,
            result.health_score,
        )
        return result, usage

    @staticmethod
    def prompt_version() -> str:
        return MONITORING_PROMPT_VERSION
