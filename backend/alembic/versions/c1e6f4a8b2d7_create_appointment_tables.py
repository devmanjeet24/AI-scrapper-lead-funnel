"""create appointment and google calendar tables

Revision ID: c1e6f4a8b2d7
Revises: b9d5e3f2a4c6
Create Date: 2026-06-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "c1e6f4a8b2d7"
down_revision: Union[str, Sequence[str], None] = "b9d5e3f2a4c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

google_calendar_connection_status = postgresql.ENUM(
    "active",
    "revoked",
    "expired",
    name="google_calendar_connection_status",
    create_type=False,
)
appointment_status = postgresql.ENUM(
    "proposed",
    "pending_confirmation",
    "confirmed",
    "cancelled",
    "failed",
    name="appointment_status",
    create_type=False,
)
handoff_status = postgresql.ENUM(
    "not_required",
    "pending",
    "sent",
    "acknowledged",
    name="handoff_status",
    create_type=False,
)


def upgrade() -> None:
    """Upgrade schema."""
    google_calendar_connection_status.create(op.get_bind(), checkfirst=True)
    appointment_status.create(op.get_bind(), checkfirst=True)
    handoff_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "google_calendar_connections",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("connected_by_id", sa.UUID(), nullable=True),
        sa.Column("google_email", sa.String(length=320), nullable=True),
        sa.Column("calendar_id", sa.String(length=255), nullable=False),
        sa.Column("access_token_encrypted", sa.Text(), nullable=True),
        sa.Column("refresh_token_encrypted", sa.Text(), nullable=True),
        sa.Column("token_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("scopes", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("status", google_calendar_connection_status, nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["connected_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_google_calendar_connections_organization_id",
        "google_calendar_connections",
        ["organization_id"],
        unique=True,
    )
    op.create_index(
        op.f("ix_google_calendar_connections_status"),
        "google_calendar_connections",
        ["status"],
        unique=False,
    )

    op.create_table(
        "appointments",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("lead_id", sa.UUID(), nullable=False),
        sa.Column("conversation_id", sa.UUID(), nullable=False),
        sa.Column("campaign_id", sa.UUID(), nullable=False),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("status", appointment_status, nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("attendee_email", sa.String(length=320), nullable=True),
        sa.Column("attendee_name", sa.String(length=255), nullable=True),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=False),
        sa.Column("google_event_id", sa.String(length=255), nullable=True),
        sa.Column("google_calendar_id", sa.String(length=255), nullable=True),
        sa.Column("google_event_link", sa.String(length=2048), nullable=True),
        sa.Column("agent_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("handoff_status", handoff_status, nullable=False),
        sa.Column("handoff_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("handed_off_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["outreach_conversations.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(["campaign_id"], ["outreach_campaigns.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_appointments_organization_id"),
        "appointments",
        ["organization_id"],
        unique=False,
    )
    op.create_index(op.f("ix_appointments_lead_id"), "appointments", ["lead_id"], unique=False)
    op.create_index(
        op.f("ix_appointments_campaign_id"),
        "appointments",
        ["campaign_id"],
        unique=False,
    )
    op.create_index(op.f("ix_appointments_status"), "appointments", ["status"], unique=False)
    op.create_index("ix_appointments_conversation_id", "appointments", ["conversation_id"], unique=False)
    op.create_index(
        "ix_appointments_organization_id_lead_id",
        "appointments",
        ["organization_id", "lead_id"],
        unique=False,
    )
    op.create_index(
        "ix_appointments_organization_id_status",
        "appointments",
        ["organization_id", "status"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_appointments_organization_id_status", table_name="appointments")
    op.drop_index("ix_appointments_organization_id_lead_id", table_name="appointments")
    op.drop_index("ix_appointments_conversation_id", table_name="appointments")
    op.drop_index(op.f("ix_appointments_status"), table_name="appointments")
    op.drop_index(op.f("ix_appointments_campaign_id"), table_name="appointments")
    op.drop_index(op.f("ix_appointments_lead_id"), table_name="appointments")
    op.drop_index(op.f("ix_appointments_organization_id"), table_name="appointments")
    op.drop_table("appointments")

    op.drop_index(op.f("ix_google_calendar_connections_status"), table_name="google_calendar_connections")
    op.drop_index(
        "ix_google_calendar_connections_organization_id",
        table_name="google_calendar_connections",
    )
    op.drop_table("google_calendar_connections")

    handoff_status.drop(op.get_bind(), checkfirst=True)
    appointment_status.drop(op.get_bind(), checkfirst=True)
    google_calendar_connection_status.drop(op.get_bind(), checkfirst=True)
