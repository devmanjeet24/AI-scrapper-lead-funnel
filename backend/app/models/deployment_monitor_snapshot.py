from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Enum, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import MonitoringSnapshotSource
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.deployment_package import DeploymentPackage
    from app.models.organization import Organization
    from app.models.user import User


class DeploymentMonitorSnapshot(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "deployment_monitor_snapshots"
    __table_args__ = (
        Index(
            "ix_deployment_monitor_snapshots_package_recorded_at",
            "deployment_package_id",
            "recorded_at",
        ),
        Index(
            "ix_deployment_monitor_snapshots_organization_id",
            "organization_id",
        ),
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    deployment_package_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("deployment_packages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recorded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    source: Mapped[MonitoringSnapshotSource] = mapped_column(
        Enum(MonitoringSnapshotSource, name="monitoring_snapshot_source"),
        nullable=False,
        default=MonitoringSnapshotSource.manual,
    )
    metrics: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    agent_analysis: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    organization: Mapped[Organization] = relationship(back_populates="deployment_monitor_snapshots")
    deployment_package: Mapped[DeploymentPackage] = relationship(
        back_populates="monitor_snapshots",
    )
    recorded_by: Mapped[User | None] = relationship(
        back_populates="recorded_monitor_snapshots",
        foreign_keys=[recorded_by_id],
    )
