from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import (
    OutreachCampaignStatus,
    OutreachChannel,
    OutreachConversationStatus,
    OutreachMessageRole,
    QualificationVerdict,
)


class OutreachCampaignCreate(BaseModel):
    channel: OutreachChannel = OutreachChannel.internal
    subject: str | None = Field(default=None, max_length=500)
    recipient_email: EmailStr | None = None
    recipient_phone: str | None = Field(default=None, max_length=50)


class LeadReplyCreate(BaseModel):
    content: str = Field(min_length=1)
    auto_vet: bool = True


class OutreachCampaignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    lead_id: UUID
    deployment_package_id: UUID | None
    created_by_id: UUID | None
    status: OutreachCampaignStatus
    channel: OutreachChannel
    subject: str | None
    recipient_email: str | None
    recipient_phone: str | None
    agent_metadata: dict[str, Any]
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class OutreachConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    campaign_id: UUID
    lead_id: UUID
    status: OutreachConversationStatus
    qualification_score: int | None
    qualification_verdict: QualificationVerdict | None
    vetting_result: dict[str, Any] | None
    summary: str | None
    created_at: datetime
    updated_at: datetime


class OutreachMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    conversation_id: UUID
    role: OutreachMessageRole
    channel: OutreachChannel
    subject: str | None
    content: str
    delivery_metadata: dict[str, Any]
    created_at: datetime
    updated_at: datetime


class PaginatedOutreachCampaignsResponse(BaseModel):
    items: list[OutreachCampaignResponse]
    total: int
    limit: int
    offset: int


class PaginatedOutreachMessagesResponse(BaseModel):
    items: list[OutreachMessageResponse]
    total: int
    limit: int
    offset: int


class VettingResponse(BaseModel):
    conversation: OutreachConversationResponse
    qualification_score: int
    qualification_verdict: QualificationVerdict
    summary: str
    recommended_next_step: str
    buying_signals: list[str]
    red_flags: list[str]
