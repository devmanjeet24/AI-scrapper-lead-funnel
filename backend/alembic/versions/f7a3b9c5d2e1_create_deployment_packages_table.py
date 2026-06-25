"""create deployment_packages table

Revision ID: f7a3b9c5d2e1
Revises: e6f2a8b4c1d0
Create Date: 2026-06-25 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "f7a3b9c5d2e1"
down_revision: Union[str, Sequence[str], None] = "e6f2a8b4c1d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

deployment_package_status = postgresql.ENUM(
    "ready",
    "deployed",
    "failed",
    name="deployment_package_status",
    create_type=False,
)


def upgrade() -> None:
    """Upgrade schema."""
    deployment_package_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "deployment_packages",
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("creative_set_id", sa.UUID(), nullable=False),
        sa.Column("lead_id", sa.UUID(), nullable=False),
        sa.Column("created_by_id", sa.UUID(), nullable=True),
        sa.Column("status", deployment_package_status, nullable=False),
        sa.Column("channel_hint", sa.String(length=100), nullable=True),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("deploy_result", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("deployed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["creative_set_id"], ["creative_sets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_deployment_packages_organization_id"),
        "deployment_packages",
        ["organization_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_deployment_packages_lead_id"),
        "deployment_packages",
        ["lead_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_deployment_packages_status"),
        "deployment_packages",
        ["status"],
        unique=False,
    )
    op.create_index(
        "ix_deployment_packages_organization_id_lead_id",
        "deployment_packages",
        ["organization_id", "lead_id"],
        unique=False,
    )
    op.create_index(
        "ix_deployment_packages_organization_id_status",
        "deployment_packages",
        ["organization_id", "status"],
        unique=False,
    )
    op.create_index(
        "ix_deployment_packages_creative_set_id",
        "deployment_packages",
        ["creative_set_id"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_deployment_packages_creative_set_id", table_name="deployment_packages")
    op.drop_index("ix_deployment_packages_organization_id_status", table_name="deployment_packages")
    op.drop_index("ix_deployment_packages_organization_id_lead_id", table_name="deployment_packages")
    op.drop_index(op.f("ix_deployment_packages_status"), table_name="deployment_packages")
    op.drop_index(op.f("ix_deployment_packages_lead_id"), table_name="deployment_packages")
    op.drop_index(op.f("ix_deployment_packages_organization_id"), table_name="deployment_packages")
    op.drop_table("deployment_packages")
    deployment_package_status.drop(op.get_bind(), checkfirst=True)
