from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import Enum, ForeignKey, Index, Integer, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import OutreachConversationStatus, QualificationVerdict
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.appointment import Appointment
    from app.models.lead import Lead
    from app.models.organization import Organization
    from app.models.outreach_campaign import OutreachCampaign
    from app.models.outreach_message import OutreachMessage


class OutreachConversation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "outreach_conversations"
    __table_args__ = (
        Index(
            "ix_outreach_conversations_organization_id_status",
            "organization_id",
            "status",
        ),
        Index("ix_outreach_conversations_campaign_id", "campaign_id"),
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("outreach_campaigns.id", ondelete="CASCADE"),
        nullable=False,
    )
    lead_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("leads.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[OutreachConversationStatus] = mapped_column(
        Enum(OutreachConversationStatus, name="outreach_conversation_status"),
        nullable=False,
        default=OutreachConversationStatus.open,
        index=True,
    )
    qualification_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    qualification_verdict: Mapped[QualificationVerdict | None] = mapped_column(
        Enum(QualificationVerdict, name="qualification_verdict", create_type=False),
        nullable=True,
    )
    vetting_result: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    organization: Mapped[Organization] = relationship(back_populates="outreach_conversations")
    campaign: Mapped[OutreachCampaign] = relationship(back_populates="conversations")
    lead: Mapped[Lead] = relationship(back_populates="outreach_conversations")
    messages: Mapped[list[OutreachMessage]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="OutreachMessage.created_at",
    )
    appointments: Mapped[list[Appointment]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
    )
