"""create outreach tables

Revision ID: b9d5e3f2a4c6
Revises: a8c4d2e1f3b5
Create Date: 2026-06-25 23:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "b9d5e3f2a4c6"
down_revision: Union[str, Sequence[str], None] = "a8c4d2e1f3b5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

outreach_channel = postgresql.ENUM(
    "internal",
    "email",
    "sms",
    "voice",
    name="outreach_channel",
    create_type=False,
)
outreach_campaign_status = postgresql.ENUM(
    "draft",
    "active",
    "paused",
    "completed",
    "failed",
    name="outreach_campaign_status",
    create_type=False,
)
outreach_conversation_status = postgresql.ENUM(
    "open",
    "qualified",
    "disqualified",
    "handoff",
    "closed",
    name="outreach_conversation_status",
    create_type=False,
)
outreach_message_role = postgresql.ENUM(
    "agent",
    "lead",
    "system",
    name="outreach_message_role",
    create_type=False,
)
qualification_verdict = postgresql.ENUM(
    "qualified",
    "needs_more_info",
    "disqualified",
    "handoff",
    name="qualification_verdict",
    create_type=False,
)


def upgrade() -> None:
    """Upgrade schema."""
    outreach_channel.create(op.get_bind(), checkfirst=True)
    outreach_campaign_status.create(op.get_bind(), checkfirst=True)
    outreach_conversation_status.create(op.get_bind(), checkfirst=True)
    outreach_message_role.create(op.get_bind(), checkfirst=True)
    qualification_verdict.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "outreach_campaigns",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("lead_id", sa.UUID(), nullable=False),
        sa.Column("deployment_package_id", sa.UUID(), nullable=True),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("status", outreach_campaign_status, nullable=False),
        sa.Column("channel", outreach_channel, nullable=False),
        sa.Column("subject", sa.String(length=500), nullable=True),
        sa.Column("recipient_email", sa.String(length=320), nullable=True),
        sa.Column("recipient_phone", sa.String(length=50), nullable=True),
        sa.Column("agent_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
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
            ["deployment_package_id"],
            ["deployment_packages.id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_outreach_campaigns_organization_id"),
        "outreach_campaigns",
        ["organization_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_outreach_campaigns_lead_id"),
        "outreach_campaigns",
        ["lead_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_outreach_campaigns_deployment_package_id"),
        "outreach_campaigns",
        ["deployment_package_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_outreach_campaigns_status"),
        "outreach_campaigns",
        ["status"],
        unique=False,
    )
    op.create_index(
        "ix_outreach_campaigns_organization_id_lead_id",
        "outreach_campaigns",
        ["organization_id", "lead_id"],
        unique=False,
    )
    op.create_index(
        "ix_outreach_campaigns_organization_id_status",
        "outreach_campaigns",
        ["organization_id", "status"],
        unique=False,
    )

    op.create_table(
        "outreach_conversations",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("campaign_id", sa.UUID(), nullable=False),
        sa.Column("lead_id", sa.UUID(), nullable=False),
        sa.Column("status", outreach_conversation_status, nullable=False),
        sa.Column("qualification_score", sa.Integer(), nullable=True),
        sa.Column("qualification_verdict", qualification_verdict, nullable=True),
        sa.Column("vetting_result", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
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
        sa.ForeignKeyConstraint(["campaign_id"], ["outreach_campaigns.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_outreach_conversations_organization_id"),
        "outreach_conversations",
        ["organization_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_outreach_conversations_lead_id"),
        "outreach_conversations",
        ["lead_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_outreach_conversations_status"),
        "outreach_conversations",
        ["status"],
        unique=False,
    )
    op.create_index(
        "ix_outreach_conversations_campaign_id",
        "outreach_conversations",
        ["campaign_id"],
        unique=False,
    )
    op.create_index(
        "ix_outreach_conversations_organization_id_status",
        "outreach_conversations",
        ["organization_id", "status"],
        unique=False,
    )

    op.create_table(
        "outreach_messages",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("conversation_id", sa.UUID(), nullable=False),
        sa.Column("role", outreach_message_role, nullable=False),
        sa.Column("channel", outreach_channel, nullable=False),
        sa.Column("subject", sa.String(length=500), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("delivery_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
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
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["outreach_conversations.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_outreach_messages_organization_id"),
        "outreach_messages",
        ["organization_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_outreach_messages_conversation_id"),
        "outreach_messages",
        ["conversation_id"],
        unique=False,
    )
    op.create_index(
        "ix_outreach_messages_conversation_id_created_at",
        "outreach_messages",
        ["conversation_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        "ix_outreach_messages_conversation_id_created_at",
        table_name="outreach_messages",
    )
    op.drop_index(op.f("ix_outreach_messages_conversation_id"), table_name="outreach_messages")
    op.drop_index(op.f("ix_outreach_messages_organization_id"), table_name="outreach_messages")
    op.drop_table("outreach_messages")

    op.drop_index(
        "ix_outreach_conversations_organization_id_status",
        table_name="outreach_conversations",
    )
    op.drop_index("ix_outreach_conversations_campaign_id", table_name="outreach_conversations")
    op.drop_index(op.f("ix_outreach_conversations_status"), table_name="outreach_conversations")
    op.drop_index(op.f("ix_outreach_conversations_lead_id"), table_name="outreach_conversations")
    op.drop_index(
        op.f("ix_outreach_conversations_organization_id"),
        table_name="outreach_conversations",
    )
    op.drop_table("outreach_conversations")

    op.drop_index(
        "ix_outreach_campaigns_organization_id_status",
        table_name="outreach_campaigns",
    )
    op.drop_index(
        "ix_outreach_campaigns_organization_id_lead_id",
        table_name="outreach_campaigns",
    )
    op.drop_index(op.f("ix_outreach_campaigns_status"), table_name="outreach_campaigns")
    op.drop_index(
        op.f("ix_outreach_campaigns_deployment_package_id"),
        table_name="outreach_campaigns",
    )
    op.drop_index(op.f("ix_outreach_campaigns_lead_id"), table_name="outreach_campaigns")
    op.drop_index(op.f("ix_outreach_campaigns_organization_id"), table_name="outreach_campaigns")
    op.drop_table("outreach_campaigns")

    qualification_verdict.drop(op.get_bind(), checkfirst=True)
    outreach_message_role.drop(op.get_bind(), checkfirst=True)
    outreach_conversation_status.drop(op.get_bind(), checkfirst=True)
    outreach_campaign_status.drop(op.get_bind(), checkfirst=True)
    outreach_channel.drop(op.get_bind(), checkfirst=True)
