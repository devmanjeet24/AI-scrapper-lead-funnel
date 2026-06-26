"""create signals table

Revision ID: a8f3c2d1e4b5
Revises: 43a33297f8e8
Create Date: 2026-06-24 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "a8f3c2d1e4b5"
down_revision: Union[str, Sequence[str], None] = "43a33297f8e8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "signals",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("scrape_job_id", sa.UUID(), nullable=False),
        sa.Column("scrape_result_id", sa.UUID(), nullable=False),
        sa.Column(
            "signal_type",
            sa.Enum(
                "lead",
                "competitor_intel",
                "review",
                "mention",
                "hiring",
                "pricing_change",
                "news",
                "other",
                name="signal_type",
            ),
            nullable=False,
        ),
        sa.Column(
            "source_type",
            postgresql.ENUM(
                "web",
                "social",
                "competitor",
                "review",
                "other",
                name="scrape_source_type",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("raw_snippet", sa.Text(), nullable=True),
        sa.Column("source_url", sa.String(length=2048), nullable=True),
        sa.Column("source_label", sa.String(length=255), nullable=True),
        sa.Column("extracted_data", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("fingerprint", sa.String(length=128), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "new",
                "reviewed",
                "qualified",
                "dismissed",
                "converted",
                "duplicate",
                name="signal_status",
            ),
            nullable=False,
        ),
        sa.Column(
            "priority",
            sa.Enum("low", "medium", "high", name="signal_priority"),
            nullable=True,
        ),
        sa.Column("reviewed_by_id", sa.UUID(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("dismissed_reason", sa.String(length=500), nullable=True),
        sa.Column("converted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("extraction_model", sa.String(length=100), nullable=True),
        sa.Column("agent_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("detected_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["scrape_job_id"], ["scrape_jobs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["scrape_result_id"], ["scrape_results.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewed_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_signals_organization_id"), "signals", ["organization_id"], unique=False)
    op.create_index("ix_signals_organization_id_created_at", "signals", ["organization_id", "created_at"], unique=False)
    op.create_index(
        "ix_signals_organization_id_fingerprint",
        "signals",
        ["organization_id", "fingerprint"],
        unique=True,
        postgresql_where=sa.text("fingerprint IS NOT NULL"),
    )
    op.create_index("ix_signals_organization_id_status", "signals", ["organization_id", "status"], unique=False)
    op.create_index(op.f("ix_signals_scrape_job_id"), "signals", ["scrape_job_id"], unique=False)
    op.create_index(op.f("ix_signals_scrape_result_id"), "signals", ["scrape_result_id"], unique=False)
    op.create_index(op.f("ix_signals_status"), "signals", ["status"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_signals_status"), table_name="signals")
    op.drop_index(op.f("ix_signals_scrape_result_id"), table_name="signals")
    op.drop_index(op.f("ix_signals_scrape_job_id"), table_name="signals")
    op.drop_index("ix_signals_organization_id_status", table_name="signals")
    op.drop_index("ix_signals_organization_id_fingerprint", table_name="signals")
    op.drop_index("ix_signals_organization_id_created_at", table_name="signals")
    op.drop_index(op.f("ix_signals_organization_id"), table_name="signals")
    op.drop_table("signals")
    sa.Enum(name="signal_priority").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="signal_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="signal_type").drop(op.get_bind(), checkfirst=True)
