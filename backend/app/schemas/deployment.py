from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import DeploymentPackageStatus


class DeploymentPackageCreate(BaseModel):
    channel_hint: str | None = Field(default=None, max_length=100)


class DeploymentPackageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    creative_set_id: UUID
    lead_id: UUID
    created_by_id: UUID | None
    status: DeploymentPackageStatus
    channel_hint: str | None
    payload: dict[str, Any]
    deploy_result: dict[str, Any] | None
    deployed_at: datetime | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class PaginatedDeploymentPackagesResponse(BaseModel):
    items: list[DeploymentPackageResponse]
    total: int
    limit: int
    offset: int
