from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.appointment import Appointment
    from app.models.creative_asset import CreativeAsset
    from app.models.creative_set import CreativeSet
    from app.models.deployment_monitor_snapshot import DeploymentMonitorSnapshot
    from app.models.deployment_package import DeploymentPackage
    from app.models.google_calendar_connection import GoogleCalendarConnection
    from app.models.lead import Lead
    from app.models.outreach_campaign import OutreachCampaign
    from app.models.outreach_conversation import OutreachConversation
    from app.models.outreach_message import OutreachMessage
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
    leads: Mapped[list[Lead]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    creative_sets: Mapped[list[CreativeSet]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    creative_assets: Mapped[list[CreativeAsset]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    deployment_packages: Mapped[list[DeploymentPackage]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    deployment_monitor_snapshots: Mapped[list[DeploymentMonitorSnapshot]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    outreach_campaigns: Mapped[list[OutreachCampaign]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    outreach_conversations: Mapped[list[OutreachConversation]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    outreach_messages: Mapped[list[OutreachMessage]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    google_calendar_connection: Mapped[GoogleCalendarConnection | None] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
        uselist=False,
    )
    appointments: Mapped[list[Appointment]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
