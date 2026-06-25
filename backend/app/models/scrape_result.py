from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import ScrapeResultStatus
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.scrape_job import ScrapeJob
    from app.models.signal import Signal
    from app.models.user import User


class ScrapeResult(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "scrape_results"
    __table_args__ = (
        Index("ix_scrape_results_job_id_created_at", "job_id", "created_at"),
    )

    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scrape_jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    triggered_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[ScrapeResultStatus] = mapped_column(
        Enum(ScrapeResultStatus, name="scrape_result_status"),
        nullable=False,
        default=ScrapeResultStatus.pending,
        index=True,
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    page_title: Mapped[str | None] = mapped_column(String(512), nullable=True)
    raw_html: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    items_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    artifact_urls: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    metadata_: Mapped[dict[str, Any] | None] = mapped_column("metadata", JSONB, nullable=True)

    job: Mapped[ScrapeJob] = relationship(back_populates="results")
    triggered_by: Mapped[User | None] = relationship(back_populates="triggered_scrape_results")
    signals: Mapped[list[Signal]] = relationship(
        back_populates="scrape_result",
        cascade="all, delete-orphan",
    )
