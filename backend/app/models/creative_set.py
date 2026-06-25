from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import CreativeSetStatus
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.creative_asset import CreativeAsset
    from app.models.deployment_package import DeploymentPackage
    from app.models.lead import Lead
    from app.models.organization import Organization
    from app.models.scrape_job import ScrapeJob
    from app.models.scrape_result import ScrapeResult
    from app.models.signal import Signal
    from app.models.user import User


class CreativeSet(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "creative_sets"
    __table_args__ = (
        Index("ix_creative_sets_organization_id_lead_id", "organization_id", "lead_id"),
        Index("ix_creative_sets_organization_id_created_at", "organization_id", "created_at"),
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
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    signal_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("signals.id", ondelete="SET NULL"),
        nullable=True,
    )
    scrape_job_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scrape_jobs.id", ondelete="SET NULL"),
        nullable=True,
    )
    scrape_result_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("scrape_results.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[CreativeSetStatus] = mapped_column(
        Enum(CreativeSetStatus, name="creative_set_status"),
        nullable=False,
        default=CreativeSetStatus.pending,
        index=True,
    )
    campaign_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    campaign_objective: Mapped[str | None] = mapped_column(Text, nullable=True)
    generation_params: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    extraction_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    agent_metadata: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    organization: Mapped[Organization] = relationship(back_populates="creative_sets")
    lead: Mapped[Lead] = relationship(back_populates="creative_sets")
    created_by: Mapped[User | None] = relationship(
        back_populates="created_creative_sets",
        foreign_keys=[created_by_id],
    )
    signal: Mapped[Signal | None] = relationship(back_populates="creative_sets")
    scrape_job: Mapped[ScrapeJob | None] = relationship(back_populates="creative_sets")
    scrape_result: Mapped[ScrapeResult | None] = relationship(back_populates="creative_sets")
    assets: Mapped[list[CreativeAsset]] = relationship(
        back_populates="creative_set",
        cascade="all, delete-orphan",
        order_by="CreativeAsset.sort_order",
    )
    deployment_package: Mapped[DeploymentPackage | None] = relationship(
        back_populates="creative_set",
        uselist=False,
    )
