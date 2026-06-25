from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import CreativeAssetStatus, CreativeAssetType
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.creative_set import CreativeSet
    from app.models.organization import Organization
    from app.models.user import User


class CreativeAsset(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "creative_assets"
    __table_args__ = (
        Index(
            "ix_creative_assets_set_id_status",
            "creative_set_id",
            "status",
        ),
        Index(
            "ix_creative_assets_organization_id_status",
            "organization_id",
            "status",
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
        index=True,
    )
    asset_type: Mapped[CreativeAssetType] = mapped_column(
        Enum(CreativeAssetType, name="creative_asset_type"),
        nullable=False,
    )
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    body_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[CreativeAssetStatus] = mapped_column(
        Enum(CreativeAssetStatus, name="creative_asset_status"),
        nullable=False,
        default=CreativeAssetStatus.draft,
        index=True,
    )
    reviewed_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)

    organization: Mapped[Organization] = relationship(back_populates="creative_assets")
    creative_set: Mapped[CreativeSet] = relationship(back_populates="assets")
    reviewed_by: Mapped[User | None] = relationship(
        back_populates="reviewed_creative_assets",
        foreign_keys=[reviewed_by_id],
    )
