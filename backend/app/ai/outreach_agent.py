from __future__ import annotations

import logging
from typing import Any

from app.ai.groq_client import GroqClient
from app.ai.outreach_prompts import (
    PROMPT_VERSION,
    VETTING_PROMPT_VERSION,
    build_outreach_system_prompt,
    build_outreach_user_prompt,
    build_vetting_system_prompt,
    build_vetting_user_prompt,
)
from app.ai.outreach_schemas import OutreachDraftResult, QualificationResult
from app.ai.schemas import LLMUsage

logger = logging.getLogger(__name__)


class OutreachAgent:
    """LLM Agent 3 — drafts personalized outreach messages."""

    async def draft_outreach(
        self,
        *,
        lead_context: dict[str, Any],
        deployment_context: dict[str, Any],
        channel: str,
        recipient_email: str | None = None,
    ) -> tuple[OutreachDraftResult, LLMUsage]:
        system_prompt = build_outreach_system_prompt()
        user_prompt = build_outreach_user_prompt(
            lead_title=lead_context.get("title"),
            lead_summary=lead_context.get("summary"),
            lead_score=lead_context.get("lead_score"),
            lead_priority=lead_context.get("priority"),
            lead_recommendation=lead_context.get("recommendation"),
            source_url=lead_context.get("source_url"),
            campaign_name=deployment_context.get("campaign_name"),
            channel_hint=deployment_context.get("channel_hint"),
            deployment_mode=deployment_context.get("deployment_mode", "export"),
            primary_headline=deployment_context.get("primary_headline"),
            ad_copy_summary=deployment_context.get("ad_copy_summary"),
            channel=channel,
            recipient_email=recipient_email,
        )

        client = GroqClient()
        result, usage = await client.analyze_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=OutreachDraftResult,
        )
        logger.info("Outreach draft complete model=%s subject_len=%s", usage.model, len(result.subject))
        return result, usage

    @staticmethod
    def prompt_version() -> str:
        return PROMPT_VERSION


class VettingAgent:
    """LLM Agent 3 vetting — qualifies leads from conversation history."""

    async def qualify_conversation(
        self,
        *,
        lead_context: dict[str, Any],
        transcript: str,
    ) -> tuple[QualificationResult, LLMUsage]:
        system_prompt = build_vetting_system_prompt()
        user_prompt = build_vetting_user_prompt(
            lead_title=lead_context.get("title"),
            lead_summary=lead_context.get("summary"),
            lead_score=lead_context.get("lead_score"),
            lead_priority=lead_context.get("priority"),
            lead_recommendation=lead_context.get("recommendation"),
            transcript=transcript,
        )

        client = GroqClient()
        result, usage = await client.analyze_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=QualificationResult,
        )
        logger.info(
            "Vetting complete model=%s verdict=%s score=%s",
            usage.model,
            result.verdict.value,
            result.qualification_score,
        )
        return result, usage

    @staticmethod
    def prompt_version() -> str:
        return VETTING_PROMPT_VERSION
