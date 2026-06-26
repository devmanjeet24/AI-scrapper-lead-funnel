"""Pydantic schemas for LLM Agent 3 — outreach and vetting."""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.models.enums import QualificationVerdict


class OutreachDraftResult(BaseModel):
    subject: str
    message: str
    tone: str = Field(description="Brief description of outreach tone")
    personalization_notes: list[str] = Field(default_factory=list)
    follow_up_suggestion: str | None = None


class QualificationResult(BaseModel):
    verdict: QualificationVerdict
    qualification_score: int = Field(ge=0, le=100)
    summary: str
    buying_signals: list[str] = Field(default_factory=list)
    red_flags: list[str] = Field(default_factory=list)
    recommended_next_step: str
    suggested_reply: str | None = None
    handoff_reason: str | None = None
