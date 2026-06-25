from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import ScrapeSourceType, SignalPriority, SignalStatus, SignalType
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.creative_set import CreativeSet
    from app.models.lead import Lead
    from app.models.organization import Organization
    from app.models.scrape_job import ScrapeJob
    from app.models.scrape_result import ScrapeResult
    from app.models.user import User


class Signal(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "signals"
    __table_args__ = (
        Index("ix_signals_organization_id_status", "organization_id", "status"),
        Index("ix_signals_organization_id_created_at", "organization_id", "created_at"),
        Index(
            "ix_signals_organization_id_fingerprint",
            "organization_id",
            "fingerprint",
            unique=True,
            postgresql_where=text("fingerprint IS NOT NULL"),
        ),
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scrape_job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scrape_jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    scrape_result_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scrape_results.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    signal_type: Mapped[SignalType] = mapped_column(
        Enum(SignalType, name="signal_type"),
        nullable=False,
    )
    source_type: Mapped[ScrapeSourceType] = mapped_column(
        Enum(ScrapeSourceType, name="scrape_source_type", create_type=False),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_snippet: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    source_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    extracted_data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    fingerprint: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[SignalStatus] = mapped_column(
        Enum(SignalStatus, name="signal_status"),
        nullable=False,
        default=SignalStatus.new,
        index=True,
    )
    priority: Mapped[SignalPriority | None] = mapped_column(
        Enum(SignalPriority, name="signal_priority"),
        nullable=True,
    )
    reviewed_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    dismissed_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
    converted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    extraction_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    agent_metadata: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    detected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    organization: Mapped[Organization] = relationship(back_populates="signals")
    scrape_job: Mapped[ScrapeJob] = relationship(back_populates="signals")
    scrape_result: Mapped[ScrapeResult] = relationship(back_populates="signals")
    reviewed_by: Mapped[User | None] = relationship(back_populates="reviewed_signals")
    lead: Mapped[Lead | None] = relationship(back_populates="signal", uselist=False)
    creative_sets: Mapped[list[CreativeSet]] = relationship(back_populates="signal")
