from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import LeadStatus, SignalPriority
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.appointment import Appointment
    from app.models.creative_set import CreativeSet
    from app.models.deployment_package import DeploymentPackage
    from app.models.organization import Organization
    from app.models.outreach_campaign import OutreachCampaign
    from app.models.outreach_conversation import OutreachConversation
    from app.models.scrape_job import ScrapeJob
    from app.models.scrape_result import ScrapeResult
    from app.models.signal import Signal
    from app.models.user import User


class Lead(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "leads"
    __table_args__ = (
        Index("ix_leads_organization_id_status", "organization_id", "status"),
        Index("ix_leads_organization_id_created_at", "organization_id", "created_at"),
        Index(
            "ix_leads_organization_id_signal_id",
            "organization_id",
            "signal_id",
            unique=True,
            postgresql_where=text("signal_id IS NOT NULL"),
        ),
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    signal_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("signals.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    scrape_job_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scrape_jobs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    scrape_result_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scrape_results.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    source_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    priority: Mapped[SignalPriority | None] = mapped_column(
        Enum(SignalPriority, name="signal_priority", create_type=False),
        nullable=True,
    )
    lead_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, name="lead_status"),
        nullable=False,
        default=LeadStatus.new,
        index=True,
    )
    status_updated_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    status_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    organization: Mapped[Organization] = relationship(back_populates="leads")
    signal: Mapped[Signal | None] = relationship(back_populates="lead")
    created_by: Mapped[User | None] = relationship(
        back_populates="created_leads",
        foreign_keys=[created_by_id],
    )
    status_updated_by: Mapped[User | None] = relationship(
        back_populates="status_updated_leads",
        foreign_keys=[status_updated_by_id],
    )
    scrape_job: Mapped[ScrapeJob | None] = relationship(back_populates="leads")
    scrape_result: Mapped[ScrapeResult | None] = relationship(back_populates="leads")
    creative_sets: Mapped[list[CreativeSet]] = relationship(
        back_populates="lead",
        cascade="all, delete-orphan",
    )
    deployment_packages: Mapped[list[DeploymentPackage]] = relationship(
        back_populates="lead",
        cascade="all, delete-orphan",
    )
    outreach_campaigns: Mapped[list[OutreachCampaign]] = relationship(
        back_populates="lead",
        cascade="all, delete-orphan",
    )
    outreach_conversations: Mapped[list[OutreachConversation]] = relationship(
        back_populates="lead",
        cascade="all, delete-orphan",
    )
    appointments: Mapped[list[Appointment]] = relationship(
        back_populates="lead",
        cascade="all, delete-orphan",
    )
