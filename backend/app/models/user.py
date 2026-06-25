from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.creative_asset import CreativeAsset
    from app.models.creative_set import CreativeSet
    from app.models.deployment_package import DeploymentPackage
    from app.models.lead import Lead
    from app.models.organization import Organization
    from app.models.scrape_job import ScrapeJob
    from app.models.scrape_result import ScrapeResult
    from app.models.signal import Signal


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    organization: Mapped[Organization] = relationship(back_populates="users")
    created_scrape_jobs: Mapped[list[ScrapeJob]] = relationship(back_populates="created_by")
    triggered_scrape_results: Mapped[list[ScrapeResult]] = relationship(back_populates="triggered_by")
    reviewed_signals: Mapped[list[Signal]] = relationship(back_populates="reviewed_by")
    created_leads: Mapped[list[Lead]] = relationship(
        back_populates="created_by",
        foreign_keys="Lead.created_by_id",
    )
    status_updated_leads: Mapped[list[Lead]] = relationship(
        back_populates="status_updated_by",
        foreign_keys="Lead.status_updated_by_id",
    )
    created_creative_sets: Mapped[list[CreativeSet]] = relationship(
        back_populates="created_by",
        foreign_keys="CreativeSet.created_by_id",
    )
    reviewed_creative_assets: Mapped[list[CreativeAsset]] = relationship(
        back_populates="reviewed_by",
        foreign_keys="CreativeAsset.reviewed_by_id",
    )
    created_deployment_packages: Mapped[list[DeploymentPackage]] = relationship(
        back_populates="created_by",
        foreign_keys="DeploymentPackage.created_by_id",
    )
