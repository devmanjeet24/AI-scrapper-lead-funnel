"""Pydantic schemas for LLM Agent 2 — deployment planning and monitoring."""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.models.enums import DeploymentMode, MonitoringRecommendation


class DeploymentPlanResult(BaseModel):
    recommended_mode: DeploymentMode = DeploymentMode.export
    channel: str = Field(description="Recommended ad channel, e.g. social, search, display")
    campaign_structure: str = Field(description="How to structure the campaign")
    budget_recommendation: str = Field(description="Suggested daily/total budget range")
    targeting_summary: str = Field(description="Audience targeting approach")
    schedule_recommendation: str = Field(description="When to run the campaign")
    primary_headline: str | None = None
    primary_ad_copy_summary: str | None = None
    risk_notes: list[str] = Field(default_factory=list)
    optimization_tips: list[str] = Field(default_factory=list)
    readiness_score: int = Field(ge=0, le=100, description="0-100 deployment readiness")
    summary: str = Field(description="Executive summary of the deployment plan")


class MonitoringAnalysisResult(BaseModel):
    recommendation: MonitoringRecommendation
    health_score: int = Field(ge=0, le=100, description="0-100 campaign health")
    summary: str
    key_findings: list[str] = Field(default_factory=list)
    action_items: list[str] = Field(default_factory=list)
    suggested_budget_change: str | None = None
    creative_suggestions: list[str] = Field(default_factory=list)
    alert_level: str = Field(default="info", description="info, warning, or critical")
