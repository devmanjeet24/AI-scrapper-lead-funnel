from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import CreativeAssetStatus, CreativeAssetType, CreativeSetStatus


class CreativeGenerateRequest(BaseModel):
    tone: str | None = Field(default=None, max_length=100)
    objective: str | None = Field(default=None, max_length=500)
    max_headlines: int = Field(default=5, ge=1, le=10)
    max_ad_copy_variants: int = Field(default=3, ge=1, le=5)
    include_targeting: bool = True


class CreativeAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    creative_set_id: UUID
    asset_type: CreativeAssetType
    title: str | None
    content: dict[str, Any]
    body_text: str | None
    sort_order: int
    status: CreativeAssetStatus
    reviewed_by_id: UUID | None
    reviewed_at: datetime | None
    rejection_reason: str | None
    created_at: datetime
    updated_at: datetime


class CreativeAssetUpdate(BaseModel):
    status: CreativeAssetStatus | None = None
    rejection_reason: str | None = Field(default=None, max_length=500)


class CreativeSetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    lead_id: UUID
    created_by_id: UUID | None
    signal_id: UUID | None
    scrape_job_id: UUID | None
    scrape_result_id: UUID | None
    status: CreativeSetStatus
    campaign_name: str | None
    campaign_objective: str | None
    generation_params: dict[str, Any]
    extraction_model: str | None
    agent_metadata: dict[str, Any] = Field(default_factory=dict)
    error_message: str | None
    created_at: datetime
    updated_at: datetime
    assets: list[CreativeAssetResponse] = Field(default_factory=list)


class PaginatedCreativeSetsResponse(BaseModel):
    items: list[CreativeSetResponse]
    total: int
    limit: int
    offset: int


class PaginatedCreativeAssetsResponse(BaseModel):
    items: list[CreativeAssetResponse]
    total: int
    limit: int
    offset: int
