from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import OutreachCampaignStatus, OutreachChannel
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.appointment import Appointment
    from app.models.deployment_package import DeploymentPackage
    from app.models.lead import Lead
    from app.models.organization import Organization
    from app.models.outreach_conversation import OutreachConversation
    from app.models.user import User


class OutreachCampaign(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "outreach_campaigns"
    __table_args__ = (
        Index("ix_outreach_campaigns_organization_id_lead_id", "organization_id", "lead_id"),
        Index("ix_outreach_campaigns_organization_id_status", "organization_id", "status"),
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
    deployment_package_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("deployment_packages.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[OutreachCampaignStatus] = mapped_column(
        Enum(OutreachCampaignStatus, name="outreach_campaign_status"),
        nullable=False,
        default=OutreachCampaignStatus.draft,
        index=True,
    )
    channel: Mapped[OutreachChannel] = mapped_column(
        Enum(OutreachChannel, name="outreach_channel"),
        nullable=False,
        default=OutreachChannel.internal,
    )
    subject: Mapped[str | None] = mapped_column(String(500), nullable=True)
    recipient_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    recipient_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    agent_metadata: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    organization: Mapped[Organization] = relationship(back_populates="outreach_campaigns")
    lead: Mapped[Lead] = relationship(back_populates="outreach_campaigns")
    deployment_package: Mapped[DeploymentPackage | None] = relationship(
        back_populates="outreach_campaigns",
    )
    created_by: Mapped[User | None] = relationship(
        back_populates="created_outreach_campaigns",
        foreign_keys=[created_by_id],
    )
    conversations: Mapped[list[OutreachConversation]] = relationship(
        back_populates="campaign",
        cascade="all, delete-orphan",
    )
    appointments: Mapped[list[Appointment]] = relationship(back_populates="campaign")
