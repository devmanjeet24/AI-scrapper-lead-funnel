from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import LeadStatus, SignalPriority


class LeadCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    summary: str | None = None
    source_url: str | None = Field(default=None, max_length=2048)
    source_label: str | None = Field(default=None, max_length=255)
    priority: SignalPriority | None = None
    lead_score: int | None = Field(default=None, ge=0, le=100)
    recommendation: str | None = None
    notes: str | None = None
    extracted_data: dict[str, Any] = Field(default_factory=dict)


class LeadUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=500)
    summary: str | None = None
    source_url: str | None = Field(default=None, max_length=2048)
    source_label: str | None = Field(default=None, max_length=255)
    priority: SignalPriority | None = None
    lead_score: int | None = Field(default=None, ge=0, le=100)
    recommendation: str | None = None
    notes: str | None = None
    status: LeadStatus | None = None
    closed_reason: str | None = Field(default=None, max_length=500)


class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    signal_id: UUID | None
    created_by_id: UUID | None
    scrape_job_id: UUID | None
    scrape_result_id: UUID | None
    title: str
    summary: str | None
    source_url: str | None
    source_label: str | None
    priority: SignalPriority | None
    lead_score: int | None
    recommendation: str | None
    notes: str | None
    extracted_data: dict[str, Any]
    confidence_score: float | None
    status: LeadStatus
    status_updated_by_id: UUID | None
    status_updated_at: datetime | None
    closed_reason: str | None
    closed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PaginatedLeadsResponse(BaseModel):
    items: list[LeadResponse]
    total: int
    limit: int
    offset: int
