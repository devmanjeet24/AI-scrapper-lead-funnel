from __future__ import annotations

import logging

from app.ai.groq_client import GroqClient
from app.ai.prompts import PROMPT_VERSION, build_system_prompt, build_user_prompt
from app.ai.schemas import LLMUsage, PageAnalysisInput, PageAnalysisResult
from app.core.config import settings

logger = logging.getLogger(__name__)


class PageAnalyzer:
    """Runs Groq analysis on structured scrape output (not raw HTML)."""

    async def analyze(self, page_input: PageAnalysisInput) -> tuple[PageAnalysisResult, LLMUsage]:
        truncated_text = page_input.visible_text_sample[: settings.ai_max_input_chars]
        if len(page_input.visible_text_sample) > settings.ai_max_input_chars:
            truncated_text = truncated_text.rstrip() + "…"

        system_prompt = build_system_prompt(max_signals=settings.ai_max_signals_per_page)
        user_prompt = build_user_prompt(
            job_name=page_input.job_name,
            job_description=page_input.job_description,
            source_type=page_input.source_type,
            target_url=page_input.target_url,
            final_url=page_input.final_url,
            page_title=page_input.page_title,
            meta_description=page_input.meta_description,
            canonical_url=page_input.canonical_url,
            headings_h1=page_input.headings_h1,
            headings_h2=page_input.headings_h2,
            visible_text_sample=truncated_text,
            max_signals=settings.ai_max_signals_per_page,
        )

        client = GroqClient()
        result, usage = await client.analyze_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=PageAnalysisResult,
        )

        result.signals = sorted(result.signals, key=lambda s: s.lead_score, reverse=True)[
            : settings.ai_max_signals_per_page
        ]

        logger.info(
            "Page analysis complete model=%s tokens=%s signals=%s",
            usage.model,
            usage.total_tokens,
            len(result.signals),
        )
        return result, usage

    @staticmethod
    def prompt_version() -> str:
        return PROMPT_VERSION
