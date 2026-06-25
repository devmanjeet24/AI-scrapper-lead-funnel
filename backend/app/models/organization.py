from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.scrape_job import ScrapeJob
    from app.models.signal import Signal
    from app.models.user import User


class Organization(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)

    users: Mapped[list[User]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    scrape_jobs: Mapped[list[ScrapeJob]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    signals: Mapped[list[Signal]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
