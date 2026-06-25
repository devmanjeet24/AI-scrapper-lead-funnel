from __future__ import annotations

import logging

from app.ai.creative_prompts import (
    PROMPT_VERSION,
    build_creative_system_prompt,
    build_creative_user_prompt,
)
from app.ai.creative_schemas import CreativeGenerationInput, CreativeGenerationResult
from app.ai.groq_client import GroqClient
from app.ai.schemas import LLMUsage
from app.core.config import settings

logger = logging.getLogger(__name__)


class CreativeGenerator:
    """Runs Groq creative generation from lead + scrape context."""

    async def generate(
        self,
        creative_input: CreativeGenerationInput,
        *,
        max_headlines: int = 5,
        max_ad_copy: int = 3,
    ) -> tuple[CreativeGenerationResult, LLMUsage]:
        truncated_text = creative_input.visible_text_sample[: settings.ai_max_input_chars]
        if len(creative_input.visible_text_sample) > settings.ai_max_input_chars:
            truncated_text = truncated_text.rstrip() + "…"

        system_prompt = build_creative_system_prompt(
            max_headlines=max_headlines,
            max_ad_copy=max_ad_copy,
        )
        user_prompt = build_creative_user_prompt(
            lead_title=creative_input.lead_title,
            lead_summary=creative_input.lead_summary,
            lead_recommendation=creative_input.lead_recommendation,
            lead_score=creative_input.lead_score,
            lead_priority=creative_input.lead_priority,
            lead_notes=creative_input.lead_notes,
            source_url=creative_input.source_url,
            source_label=creative_input.source_label,
            signal_type=creative_input.signal_type,
            source_type=creative_input.source_type,
            job_name=creative_input.job_name,
            job_description=creative_input.job_description,
            page_title=creative_input.page_title,
            meta_description=creative_input.meta_description,
            headings_h1=creative_input.headings_h1,
            headings_h2=creative_input.headings_h2,
            page_summary=creative_input.page_summary,
            visible_text_sample=truncated_text,
        )

        client = GroqClient()
        result, usage = await client.analyze_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=CreativeGenerationResult,
        )

        result.headlines = result.headlines[:max_headlines]
        result.ad_copy_variants = result.ad_copy_variants[:max_ad_copy]

        logger.info(
            "Creative generation complete model=%s tokens=%s headlines=%s",
            usage.model,
            usage.total_tokens,
            len(result.headlines),
        )
        return result, usage

    @staticmethod
    def prompt_version() -> str:
        return PROMPT_VERSION
