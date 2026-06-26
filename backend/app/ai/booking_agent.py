from __future__ import annotations

import json
import logging
from typing import Any

from app.ai.booking_prompts import PROMPT_VERSION, build_booking_system_prompt, build_booking_user_prompt
from app.ai.booking_schemas import BookingProposalResult
from app.ai.groq_client import GroqClient
from app.ai.schemas import LLMUsage

logger = logging.getLogger(__name__)


class BookingAgent:
    """LLM Agent 4 — recommends slots and drafts booking details."""

    async def propose_booking(
        self,
        *,
        lead_context: dict[str, Any],
        vetting_context: dict[str, Any],
        available_slots: list[dict[str, Any]],
        transcript_excerpt: str,
        notes: str | None = None,
    ) -> tuple[BookingProposalResult, LLMUsage]:
        slots_text = json.dumps(
            [
                {
                    "starts_at": s["starts_at"].isoformat()
                    if hasattr(s["starts_at"], "isoformat")
                    else s["starts_at"],
                    "ends_at": s["ends_at"].isoformat()
                    if hasattr(s["ends_at"], "isoformat")
                    else s["ends_at"],
                }
                for s in available_slots[:10]
            ],
            indent=2,
        )

        system_prompt = build_booking_system_prompt()
        user_prompt = build_booking_user_prompt(
            lead_title=lead_context.get("title"),
            lead_summary=lead_context.get("summary"),
            lead_score=lead_context.get("lead_score"),
            lead_priority=lead_context.get("priority"),
            qualification_score=vetting_context.get("qualification_score"),
            qualification_verdict=vetting_context.get("qualification_verdict"),
            vetting_summary=vetting_context.get("summary"),
            buying_signals=", ".join(vetting_context.get("buying_signals", [])),
            transcript_excerpt=transcript_excerpt[:3000],
            available_slots=slots_text,
            notes=notes,
        )

        client = GroqClient()
        result, usage = await client.analyze_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=BookingProposalResult,
        )

        logger.info(
            "Booking proposal complete model=%s confidence=%s",
            usage.model,
            result.confidence_score,
        )
        return result, usage

    @staticmethod
    def prompt_version() -> str:
        return PROMPT_VERSION
