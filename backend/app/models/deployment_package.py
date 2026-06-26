from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import DeploymentPackageStatus
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.creative_set import CreativeSet
    from app.models.deployment_monitor_snapshot import DeploymentMonitorSnapshot
    from app.models.deployment_package import DeploymentPackage
    from app.models.lead import Lead
    from app.models.organization import Organization
    from app.models.outreach_campaign import OutreachCampaign
    from app.models.user import User


class DeploymentPackage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "deployment_packages"
    __table_args__ = (
        Index("ix_deployment_packages_organization_id_lead_id", "organization_id", "lead_id"),
        Index("ix_deployment_packages_organization_id_status", "organization_id", "status"),
        Index(
            "ix_deployment_packages_creative_set_id",
            "creative_set_id",
            unique=True,
        ),
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    creative_set_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("creative_sets.id", ondelete="CASCADE"),
        nullable=False,
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
    status: Mapped[DeploymentPackageStatus] = mapped_column(
        Enum(DeploymentPackageStatus, name="deployment_package_status"),
        nullable=False,
        default=DeploymentPackageStatus.ready,
        index=True,
    )
    channel_hint: Mapped[str | None] = mapped_column(String(100), nullable=True)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    deploy_result: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    deployed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    agent_metadata: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)

    organization: Mapped[Organization] = relationship(back_populates="deployment_packages")
    creative_set: Mapped[CreativeSet] = relationship(back_populates="deployment_package")
    lead: Mapped[Lead] = relationship(back_populates="deployment_packages")
    created_by: Mapped[User | None] = relationship(
        back_populates="created_deployment_packages",
        foreign_keys=[created_by_id],
    )
    monitor_snapshots: Mapped[list[DeploymentMonitorSnapshot]] = relationship(
        back_populates="deployment_package",
        cascade="all, delete-orphan",
        order_by="DeploymentMonitorSnapshot.recorded_at",
    )
    outreach_campaigns: Mapped[list[OutreachCampaign]] = relationship(
        back_populates="deployment_package",
    )
