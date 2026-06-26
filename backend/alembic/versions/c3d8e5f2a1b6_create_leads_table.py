"""create leads table

Revision ID: c3d8e5f2a1b6
Revises: b7e4f1a2c9d0
Create Date: 2026-06-25 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "c3d8e5f2a1b6"
down_revision: Union[str, Sequence[str], None] = "b7e4f1a2c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "leads",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("signal_id", sa.UUID(), nullable=True),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("scrape_job_id", sa.UUID(), nullable=True),
        sa.Column("scrape_result_id", sa.UUID(), nullable=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("source_url", sa.String(length=2048), nullable=True),
        sa.Column("source_label", sa.String(length=255), nullable=True),
        sa.Column(
            "priority",
            postgresql.ENUM(
                "low",
                "medium",
                "high",
                name="signal_priority",
                create_type=False,
            ),
            nullable=True,
        ),
        sa.Column("lead_score", sa.Integer(), nullable=True),
        sa.Column("recommendation", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("extracted_data", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("new", "archived", name="lead_status"),
            nullable=False,
        ),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["signal_id"], ["signals.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["scrape_job_id"], ["scrape_jobs.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["scrape_result_id"], ["scrape_results.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_leads_organization_id"), "leads", ["organization_id"], unique=False)
    op.create_index("ix_leads_organization_id_created_at", "leads", ["organization_id", "created_at"], unique=False)
    op.create_index(
        "ix_leads_organization_id_signal_id",
        "leads",
        ["organization_id", "signal_id"],
        unique=True,
        postgresql_where=sa.text("signal_id IS NOT NULL"),
    )
    op.create_index("ix_leads_organization_id_status", "leads", ["organization_id", "status"], unique=False)
    op.create_index(op.f("ix_leads_scrape_job_id"), "leads", ["scrape_job_id"], unique=False)
    op.create_index(op.f("ix_leads_scrape_result_id"), "leads", ["scrape_result_id"], unique=False)
    op.create_index(op.f("ix_leads_signal_id"), "leads", ["signal_id"], unique=False)
    op.create_index(op.f("ix_leads_status"), "leads", ["status"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_leads_status"), table_name="leads")
    op.drop_index(op.f("ix_leads_signal_id"), table_name="leads")
    op.drop_index(op.f("ix_leads_scrape_result_id"), table_name="leads")
    op.drop_index(op.f("ix_leads_scrape_job_id"), table_name="leads")
    op.drop_index("ix_leads_organization_id_status", table_name="leads")
    op.drop_index("ix_leads_organization_id_signal_id", table_name="leads")
    op.drop_index("ix_leads_organization_id_created_at", table_name="leads")
    op.drop_index(op.f("ix_leads_organization_id"), table_name="leads")
    op.drop_table("leads")
    sa.Enum(name="lead_status").drop(op.get_bind(), checkfirst=True)
