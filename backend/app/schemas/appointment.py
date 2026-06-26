from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import (
    AppointmentStatus,
    GoogleCalendarConnectionStatus,
    HandoffStatus,
)


class GoogleCalendarConnectResponse(BaseModel):
    authorization_url: str


class GoogleCalendarStatusResponse(BaseModel):
    connected: bool
    status: GoogleCalendarConnectionStatus | None = None
    google_email: str | None = None
    calendar_id: str | None = None
    scopes: list[str] = Field(default_factory=list)


class GoogleCalendarCallbackResponse(BaseModel):
    connected: bool
    google_email: str | None
    calendar_id: str | None
    message: str


class AvailabilityQuery(BaseModel):
    duration_minutes: int | None = Field(default=None, ge=15, le=240)
    horizon_days: int | None = Field(default=None, ge=1, le=60)
    timezone: str = "UTC"


class AvailabilitySlot(BaseModel):
    starts_at: datetime
    ends_at: datetime
    timezone: str


class AvailabilityResponse(BaseModel):
    slots: list[AvailabilitySlot]
    total: int


class AppointmentCreate(BaseModel):
    starts_at: datetime
    ends_at: datetime
    attendee_email: EmailStr | None = None
    attendee_name: str | None = Field(default=None, max_length=255)
    title: str | None = Field(default=None, max_length=500)
    description: str | None = None
    timezone: str = "UTC"
    confirm_immediately: bool = True


class AppointmentProposeRequest(BaseModel):
    attendee_email: EmailStr | None = None
    attendee_name: str | None = Field(default=None, max_length=255)
    duration_minutes: int | None = Field(default=None, ge=15, le=240)
    timezone: str = "UTC"
    notes: str | None = None


class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    lead_id: UUID
    conversation_id: UUID
    campaign_id: UUID
    created_by_id: UUID | None
    status: AppointmentStatus
    title: str
    description: str | None
    attendee_email: str | None
    attendee_name: str | None
    starts_at: datetime
    ends_at: datetime
    timezone: str
    google_event_id: str | None
    google_calendar_id: str | None
    google_event_link: str | None
    agent_metadata: dict[str, Any]
    handoff_status: HandoffStatus
    handoff_payload: dict[str, Any] | None
    handed_off_at: datetime | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime


class PaginatedAppointmentsResponse(BaseModel):
    items: list[AppointmentResponse]
    total: int
    limit: int
    offset: int


class HandoffResponse(BaseModel):
    appointment: AppointmentResponse
    handoff_status: HandoffStatus
    message: str
