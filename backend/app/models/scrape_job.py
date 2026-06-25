from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import ScrapeJobStatus, ScrapeSourceType
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.scrape_result import ScrapeResult
    from app.models.signal import Signal
    from app.models.user import User


class ScrapeJob(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "scrape_jobs"
    __table_args__ = (
        Index("ix_scrape_jobs_organization_id_status", "organization_id", "status"),
        Index("ix_scrape_jobs_organization_id_created_at", "organization_id", "created_at"),
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_type: Mapped[ScrapeSourceType] = mapped_column(
        Enum(ScrapeSourceType, name="scrape_source_type"),
        nullable=False,
    )
    target_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    config: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    schedule_cron: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    status: Mapped[ScrapeJobStatus] = mapped_column(
        Enum(ScrapeJobStatus, name="scrape_job_status"),
        nullable=False,
        default=ScrapeJobStatus.active,
    )
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    organization: Mapped[Organization] = relationship(back_populates="scrape_jobs")
    created_by: Mapped[User | None] = relationship(back_populates="created_scrape_jobs")
    results: Mapped[list[ScrapeResult]] = relationship(
        back_populates="job",
        cascade="all, delete-orphan",
    )
    signals: Mapped[list[Signal]] = relationship(back_populates="scrape_job")
