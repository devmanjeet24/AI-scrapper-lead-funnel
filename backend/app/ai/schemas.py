from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from pydantic import BaseModel, Field, field_validator

from app.models.enums import SignalPriority, SignalType


class PageAnalysisInput(BaseModel):
    """Deterministic scrape output passed to the LLM — never raw HTML."""

    job_name: str
    job_description: str | None = None
    source_type: str
    target_url: str
    final_url: str | None = None
    page_title: str | None = None
    meta_description: str | None = None
    canonical_url: str | None = None
    headings_h1: list[str] = Field(default_factory=list)
    headings_h2: list[str] = Field(default_factory=list)
    visible_text_sample: str = ""


class DetectedSignal(BaseModel):
    signal_type: SignalType
    title: str = Field(min_length=1, max_length=500)
    summary: str | None = Field(default=None, max_length=2000)
    raw_snippet: str | None = Field(default=None, max_length=1000)
    confidence_score: float = Field(ge=0.0, le=1.0)
    priority: SignalPriority
    lead_score: int = Field(ge=0, le=100)
    recommendation: str = Field(min_length=1, max_length=1000)

    @field_validator("confidence_score", mode="before")
    @classmethod
    def clamp_confidence(cls, value: Any) -> float:
        numeric = float(value)
        return max(0.0, min(1.0, numeric))

    @field_validator("lead_score", mode="before")
    @classmethod
    def clamp_lead_score(cls, value: Any) -> int:
        numeric = int(value)
        return max(0, min(100, numeric))


class PageAnalysisResult(BaseModel):
    page_summary: str = Field(min_length=1, max_length=2000)
    overall_lead_score: int = Field(ge=0, le=100)
    signals: list[DetectedSignal] = Field(default_factory=list)

    @field_validator("overall_lead_score", mode="before")
    @classmethod
    def clamp_overall_lead_score(cls, value: Any) -> int:
        numeric = int(value)
        return max(0, min(100, numeric))


@dataclass(slots=True)
class LLMUsage:
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    model: str
    duration_ms: int
