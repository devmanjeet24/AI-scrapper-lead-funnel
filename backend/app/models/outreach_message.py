from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.enums import OutreachChannel, OutreachMessageRole
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.organization import Organization
    from app.models.outreach_conversation import OutreachConversation


class OutreachMessage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "outreach_messages"
    __table_args__ = (
        Index("ix_outreach_messages_conversation_id_created_at", "conversation_id", "created_at"),
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("outreach_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[OutreachMessageRole] = mapped_column(
        Enum(OutreachMessageRole, name="outreach_message_role"),
        nullable=False,
    )
    channel: Mapped[OutreachChannel] = mapped_column(
        Enum(OutreachChannel, name="outreach_channel", create_type=False),
        nullable=False,
        default=OutreachChannel.internal,
    )
    subject: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    delivery_metadata: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)

    organization: Mapped[Organization] = relationship(back_populates="outreach_messages")
    conversation: Mapped[OutreachConversation] = relationship(back_populates="messages")
