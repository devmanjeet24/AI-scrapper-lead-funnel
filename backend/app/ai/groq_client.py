from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Any

from groq import APIConnectionError, APIStatusError, AsyncGroq, AuthenticationError, RateLimitError

from app.ai.errors import LLMAuthError, LLMRateLimitError, LLMServiceError, LLMValidationError
from app.ai.rate_limiter import RateLimiter
from app.ai.schemas import LLMUsage, PageAnalysisResult
from app.core.config import settings

logger = logging.getLogger(__name__)

_rate_limiter = RateLimiter(settings.groq_max_requests_per_minute)


class GroqClient:
    """Thin Groq wrapper with rate limiting, retries, and JSON validation."""

    def __init__(self) -> None:
        if not settings.groq_api_key:
            raise LLMAuthError()
        self._client = AsyncGroq(
            api_key=settings.groq_api_key,
            timeout=settings.groq_timeout_seconds,
        )

    async def analyze_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        response_model: type[PageAnalysisResult],
    ) -> tuple[PageAnalysisResult, LLMUsage]:
        last_error: Exception | None = None

        for attempt in range(settings.groq_max_retries + 1):
            try:
                await _rate_limiter.acquire()
                return await self._call(system_prompt, user_prompt, response_model)
            except (LLMRateLimitError, APIConnectionError) as exc:
                last_error = exc
                if attempt >= settings.groq_max_retries:
                    break
                backoff = 2**attempt
                logger.warning("Groq transient error (attempt %s), retrying in %ss", attempt + 1, backoff)
                await asyncio.sleep(backoff)

        raise LLMServiceError(str(last_error) if last_error else "Groq request failed")

    async def _call(
        self,
        system_prompt: str,
        user_prompt: str,
        response_model: type[PageAnalysisResult],
    ) -> tuple[PageAnalysisResult, LLMUsage]:
        started = time.perf_counter()
        try:
            response = await self._client.chat.completions.create(
                model=settings.groq_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=settings.groq_temperature,
                max_tokens=settings.groq_max_tokens,
                response_format={"type": "json_object"},
            )
        except AuthenticationError as exc:
            raise LLMAuthError() from exc
        except RateLimitError as exc:
            raise LLMRateLimitError(str(exc)) from exc
        except APIStatusError as exc:
            if exc.status_code == 429:
                raise LLMRateLimitError(str(exc)) from exc
            raise LLMServiceError(f"Groq API error ({exc.status_code}): {exc}") from exc
        except APIConnectionError as exc:
            raise LLMServiceError(f"Groq connection error: {exc}") from exc

        content = response.choices[0].message.content
        if not content:
            raise LLMValidationError("Groq returned empty content")

        try:
            payload: dict[str, Any] = json.loads(content)
            parsed = response_model.model_validate(payload)
        except (json.JSONDecodeError, ValueError) as exc:
            raise LLMValidationError(f"Invalid JSON from Groq: {exc}") from exc

        usage = response.usage
        duration_ms = int((time.perf_counter() - started) * 1000)
        llm_usage = LLMUsage(
            prompt_tokens=usage.prompt_tokens if usage else 0,
            completion_tokens=usage.completion_tokens if usage else 0,
            total_tokens=usage.total_tokens if usage else 0,
            model=settings.groq_model,
            duration_ms=duration_ms,
        )
        return parsed, llm_usage
