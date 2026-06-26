from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import (
    DeploymentMode,
    DeploymentPackageStatus,
    MonitoringRecommendation,
    MonitoringSnapshotSource,
)


class DeploymentPackageCreate(BaseModel):
    channel_hint: str | None = Field(default=None, max_length=100)


class DeploymentExecuteRequest(BaseModel):
    mode: DeploymentMode = DeploymentMode.export


class DeploymentAnalyzeRequest(BaseModel):
    mode: DeploymentMode = DeploymentMode.export


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
    agent_metadata: dict[str, Any]
    created_at: datetime
    updated_at: datetime


class PaginatedDeploymentPackagesResponse(BaseModel):
    items: list[DeploymentPackageResponse]
    total: int
    limit: int
    offset: int


class MonitoringSnapshotCreate(BaseModel):
    impressions: int = Field(ge=0, default=0)
    clicks: int = Field(ge=0, default=0)
    spend: float = Field(ge=0, default=0.0)
    conversions: int = Field(ge=0, default=0)
    ctr: float | None = Field(default=None, ge=0)
    cpc: float | None = Field(default=None, ge=0)
    extra: dict[str, Any] = Field(default_factory=dict)


class MonitoringSnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    deployment_package_id: UUID
    recorded_by_id: UUID | None
    recorded_at: datetime
    source: MonitoringSnapshotSource
    metrics: dict[str, Any]
    agent_analysis: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime


class PaginatedMonitoringSnapshotsResponse(BaseModel):
    items: list[MonitoringSnapshotResponse]
    total: int
    limit: int
    offset: int


class MonitoringAnalysisResponse(BaseModel):
    recommendation: MonitoringRecommendation
    health_score: int
    summary: str
    key_findings: list[str]
    action_items: list[str]
    suggested_budget_change: str | None
    creative_suggestions: list[str]
    alert_level: str
    package: DeploymentPackageResponse
