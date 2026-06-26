"""create creative_sets and creative_assets tables

Revision ID: e6f2a8b4c1d0
Revises: d4f9a6b3c2e7
Create Date: 2026-06-25 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "e6f2a8b4c1d0"
down_revision: Union[str, Sequence[str], None] = "d4f9a6b3c2e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

creative_set_status = postgresql.ENUM(
    "pending",
    "generating",
    "completed",
    "failed",
    name="creative_set_status",
    create_type=False,
)
creative_asset_type = postgresql.ENUM(
    "headline",
    "ad_copy",
    "campaign_idea",
    "targeting_suggestion",
    name="creative_asset_type",
    create_type=False,
)
creative_asset_status = postgresql.ENUM(
    "draft",
    "approved",
    "rejected",
    name="creative_asset_status",
    create_type=False,
)


def upgrade() -> None:
    """Upgrade schema."""
    creative_set_status.create(op.get_bind(), checkfirst=True)
    creative_asset_type.create(op.get_bind(), checkfirst=True)
    creative_asset_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "creative_sets",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("lead_id", sa.UUID(), nullable=False),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("signal_id", sa.UUID(), nullable=True),
        sa.Column("scrape_job_id", sa.UUID(), nullable=True),
        sa.Column("scrape_result_id", sa.UUID(), nullable=True),
        sa.Column("status", creative_set_status, nullable=False),
        sa.Column("campaign_name", sa.String(length=255), nullable=True),
        sa.Column("campaign_objective", sa.Text(), nullable=True),
        sa.Column("generation_params", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("extraction_model", sa.String(length=100), nullable=True),
        sa.Column("agent_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["signal_id"], ["signals.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["scrape_job_id"], ["scrape_jobs.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["scrape_result_id"], ["scrape_results.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_creative_sets_organization_id"), "creative_sets", ["organization_id"], unique=False)
    op.create_index(op.f("ix_creative_sets_lead_id"), "creative_sets", ["lead_id"], unique=False)
    op.create_index(op.f("ix_creative_sets_status"), "creative_sets", ["status"], unique=False)
    op.create_index(
        "ix_creative_sets_organization_id_lead_id",
        "creative_sets",
        ["organization_id", "lead_id"],
        unique=False,
    )
    op.create_index(
        "ix_creative_sets_organization_id_created_at",
        "creative_sets",
        ["organization_id", "created_at"],
        unique=False,
    )

    op.create_table(
        "creative_assets",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("creative_set_id", sa.UUID(), nullable=False),
        sa.Column("asset_type", creative_asset_type, nullable=False),
        sa.Column("title", sa.String(length=500), nullable=True),
        sa.Column("content", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("body_text", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("status", creative_asset_status, nullable=False),
        sa.Column("reviewed_by_id", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.String(length=500), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["creative_set_id"], ["creative_sets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_creative_assets_organization_id"), "creative_assets", ["organization_id"], unique=False)
    op.create_index(op.f("ix_creative_assets_creative_set_id"), "creative_assets", ["creative_set_id"], unique=False)
    op.create_index(op.f("ix_creative_assets_status"), "creative_assets", ["status"], unique=False)
    op.create_index(
        "ix_creative_assets_set_id_status",
        "creative_assets",
        ["creative_set_id", "status"],
        unique=False,
    )
    op.create_index(
        "ix_creative_assets_organization_id_status",
        "creative_assets",
        ["organization_id", "status"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_creative_assets_organization_id_status", table_name="creative_assets")
    op.drop_index("ix_creative_assets_set_id_status", table_name="creative_assets")
    op.drop_index(op.f("ix_creative_assets_status"), table_name="creative_assets")
    op.drop_index(op.f("ix_creative_assets_creative_set_id"), table_name="creative_assets")
    op.drop_index(op.f("ix_creative_assets_organization_id"), table_name="creative_assets")
    op.drop_table("creative_assets")

    op.drop_index("ix_creative_sets_organization_id_created_at", table_name="creative_sets")
    op.drop_index("ix_creative_sets_organization_id_lead_id", table_name="creative_sets")
    op.drop_index(op.f("ix_creative_sets_status"), table_name="creative_sets")
    op.drop_index(op.f("ix_creative_sets_lead_id"), table_name="creative_sets")
    op.drop_index(op.f("ix_creative_sets_organization_id"), table_name="creative_sets")
    op.drop_table("creative_sets")

    creative_asset_status.drop(op.get_bind(), checkfirst=True)
    creative_asset_type.drop(op.get_bind(), checkfirst=True)
    creative_set_status.drop(op.get_bind(), checkfirst=True)
