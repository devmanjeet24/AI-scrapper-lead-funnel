from __future__ import annotations

from pydantic import BaseModel, Field


class CreativeGenerationInput(BaseModel):
    """Lead + scrape context passed to the LLM — never raw HTML."""

    lead_title: str
    lead_summary: str | None = None
    lead_recommendation: str | None = None
    lead_score: int | None = None
    lead_priority: str | None = None
    lead_notes: str | None = None
    source_url: str | None = None
    source_label: str | None = None
    signal_type: str | None = None
    source_type: str | None = None
    job_name: str | None = None
    job_description: str | None = None
    page_title: str | None = None
    meta_description: str | None = None
    headings_h1: list[str] = Field(default_factory=list)
    headings_h2: list[str] = Field(default_factory=list)
    visible_text_sample: str = ""
    page_summary: str | None = None


class AdCopyVariant(BaseModel):
    primary_text: str = Field(min_length=1, max_length=2000)
    headline: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=500)
    cta: str = Field(min_length=1, max_length=100)


class CampaignIdea(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=2000)
    channel_hint: str = Field(min_length=1, max_length=100)


class TargetingSuggestion(BaseModel):
    audience_name: str = Field(min_length=1, max_length=200)
    demographics: str = Field(min_length=1, max_length=500)
    interests: list[str] = Field(default_factory=list)
    rationale: str = Field(min_length=1, max_length=1000)


class CreativeGenerationResult(BaseModel):
    campaign_name: str = Field(min_length=1, max_length=255)
    campaign_objective: str = Field(min_length=1, max_length=1000)
    headlines: list[str] = Field(default_factory=list)
    ad_copy_variants: list[AdCopyVariant] = Field(default_factory=list)
    campaign_ideas: list[CampaignIdea] = Field(default_factory=list)
    targeting_suggestions: list[TargetingSuggestion] = Field(default_factory=list)
