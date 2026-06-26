from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import AppointmentStatus, HandoffStatus
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.lead import Lead
    from app.models.organization import Organization
    from app.models.outreach_campaign import OutreachCampaign
    from app.models.outreach_conversation import OutreachConversation
    from app.models.user import User


class Appointment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "appointments"
    __table_args__ = (
        Index("ix_appointments_organization_id_lead_id", "organization_id", "lead_id"),
        Index("ix_appointments_organization_id_status", "organization_id", "status"),
        Index("ix_appointments_conversation_id", "conversation_id"),
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("outreach_conversations.id", ondelete="CASCADE"),
        nullable=False,
    )
    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("outreach_campaigns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus, name="appointment_status"),
        nullable=False,
        default=AppointmentStatus.proposed,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    attendee_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    attendee_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="UTC")
    google_event_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    google_calendar_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    google_event_link: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    agent_metadata: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    handoff_status: Mapped[HandoffStatus] = mapped_column(
        Enum(HandoffStatus, name="handoff_status"),
        nullable=False,
        default=HandoffStatus.not_required,
    )
    handoff_payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    handed_off_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    organization: Mapped[Organization] = relationship(back_populates="appointments")
    lead: Mapped[Lead] = relationship(back_populates="appointments")
    conversation: Mapped[OutreachConversation] = relationship(back_populates="appointments")
    campaign: Mapped[OutreachCampaign] = relationship(back_populates="appointments")
    created_by: Mapped[User | None] = relationship(
        back_populates="created_appointments",
        foreign_keys=[created_by_id],
    )
