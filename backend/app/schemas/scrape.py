from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.models.enums import ScrapeJobStatus, ScrapeResultStatus, ScrapeSourceType


class ScrapeJobCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    source_type: ScrapeSourceType
    target_url: HttpUrl
    config: dict[str, Any] = Field(default_factory=dict)
    schedule_cron: str | None = Field(default=None, max_length=64)


class ScrapeJobUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    source_type: ScrapeSourceType | None = None
    target_url: HttpUrl | None = None
    config: dict[str, Any] | None = None
    schedule_cron: str | None = Field(default=None, max_length=64)
    is_active: bool | None = None
    status: ScrapeJobStatus | None = None


class ScrapeJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    created_by_id: UUID | None
    name: str
    description: str | None
    source_type: ScrapeSourceType
    target_url: str
    config: dict[str, Any]
    schedule_cron: str | None
    is_active: bool
    status: ScrapeJobStatus
    last_run_at: datetime | None
    created_at: datetime
    updated_at: datetime


class ScrapeResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    job_id: UUID
    triggered_by_id: UUID | None
    status: ScrapeResultStatus
    started_at: datetime | None
    finished_at: datetime | None
    page_title: str | None
    raw_html: str | None
    extracted_data: dict[str, Any] | None
    items_count: int | None
    summary: str | None
    error_message: str | None
    artifact_urls: dict[str, Any] | None
    metadata: dict[str, Any] | None = Field(validation_alias="metadata_")
    created_at: datetime
    updated_at: datetime


class ScrapeRunResponse(BaseModel):
    result_id: UUID
    job_id: UUID
    status: ScrapeResultStatus
    message: str


class PaginatedScrapeJobsResponse(BaseModel):
    items: list[ScrapeJobResponse]
    total: int
    limit: int
    offset: int


class PaginatedScrapeResultsResponse(BaseModel):
    items: list[ScrapeResultResponse]
    total: int
    limit: int
    offset: int
