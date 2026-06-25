from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ScrapeSourceType, SignalPriority, SignalStatus, SignalType


class SignalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    scrape_job_id: UUID
    scrape_result_id: UUID
    signal_type: SignalType
    source_type: ScrapeSourceType
    title: str
    summary: str | None
    raw_snippet: str | None
    source_url: str | None
    source_label: str | None
    extracted_data: dict[str, Any]
    confidence_score: float | None
    status: SignalStatus
    priority: SignalPriority | None
    agent_metadata: dict[str, Any] = Field(default_factory=dict)
    reviewed_by_id: UUID | None
    reviewed_at: datetime | None
    dismissed_reason: str | None
    converted_at: datetime | None
    extraction_model: str | None
    detected_at: datetime | None
    created_at: datetime
    updated_at: datetime


class SignalListResponse(BaseModel):
    items: list[SignalResponse] = Field(default_factory=list)
    total: int
    limit: int
    offset: int
