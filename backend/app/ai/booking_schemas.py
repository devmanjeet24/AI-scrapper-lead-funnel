"""Pydantic schemas for LLM Agent 4 — appointment booking."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SlotOption(BaseModel):
    starts_at: str
    ends_at: str


class BookingProposalResult(BaseModel):
    recommended_slot: SlotOption
    alternative_slots: list[SlotOption] = Field(default_factory=list)
    meeting_title: str
    meeting_agenda: str
    booking_message: str
    objection_handling_notes: str = ""
    confidence_score: int = Field(ge=0, le=100)
