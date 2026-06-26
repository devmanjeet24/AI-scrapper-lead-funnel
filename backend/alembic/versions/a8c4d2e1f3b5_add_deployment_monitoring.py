"""create deployment monitoring tables

Revision ID: a8c4d2e1f3b5
Revises: f7a3b9c5d2e1
Create Date: 2026-06-25 23:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "a8c4d2e1f3b5"
down_revision: Union[str, Sequence[str], None] = "f7a3b9c5d2e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

monitoring_snapshot_source = postgresql.ENUM(
    "manual",
    "simulated",
    "api",
    name="monitoring_snapshot_source",
    create_type=False,
)


def upgrade() -> None:
    """Upgrade schema."""
    monitoring_snapshot_source.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "deployment_packages",
        sa.Column(
            "agent_metadata",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )

    op.create_table(
        "deployment_monitor_snapshots",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("deployment_package_id", sa.UUID(), nullable=False),
        sa.Column("recorded_by_id", sa.UUID(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source", monitoring_snapshot_source, nullable=False),
        sa.Column("metrics", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("agent_analysis", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
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
            ["deployment_package_id"],
            ["deployment_packages.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(["recorded_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_deployment_monitor_snapshots_deployment_package_id"),
        "deployment_monitor_snapshots",
        ["deployment_package_id"],
        unique=False,
    )
    op.create_index(
        "ix_deployment_monitor_snapshots_organization_id",
        "deployment_monitor_snapshots",
        ["organization_id"],
        unique=False,
    )
    op.create_index(
        "ix_deployment_monitor_snapshots_package_recorded_at",
        "deployment_monitor_snapshots",
        ["deployment_package_id", "recorded_at"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        "ix_deployment_monitor_snapshots_package_recorded_at",
        table_name="deployment_monitor_snapshots",
    )
    op.drop_index(
        "ix_deployment_monitor_snapshots_organization_id",
        table_name="deployment_monitor_snapshots",
    )
    op.drop_index(
        op.f("ix_deployment_monitor_snapshots_deployment_package_id"),
        table_name="deployment_monitor_snapshots",
    )
    op.drop_table("deployment_monitor_snapshots")
    op.drop_column("deployment_packages", "agent_metadata")
    monitoring_snapshot_source.drop(op.get_bind(), checkfirst=True)
