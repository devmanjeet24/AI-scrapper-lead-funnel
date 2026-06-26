"""extend lead status lifecycle fields

Revision ID: d4f9a6b3c2e7
Revises: c3d8e5f2a1b6
Create Date: 2026-06-25 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "d4f9a6b3c2e7"
down_revision: Union[str, Sequence[str], None] = "c3d8e5f2a1b6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'contacted'")
    op.execute("ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'won'")
    op.execute("ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'lost'")

    op.add_column("leads", sa.Column("status_updated_by_id", sa.UUID(), nullable=True))
    op.add_column("leads", sa.Column("status_updated_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("leads", sa.Column("closed_reason", sa.String(length=500), nullable=True))
    op.add_column("leads", sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key(
        "fk_leads_status_updated_by_id_users",
        "leads",
        "users",
        ["status_updated_by_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("fk_leads_status_updated_by_id_users", "leads", type_="foreignkey")
    op.drop_column("leads", "closed_at")
    op.drop_column("leads", "closed_reason")
    op.drop_column("leads", "status_updated_at")
    op.drop_column("leads", "status_updated_by_id")
