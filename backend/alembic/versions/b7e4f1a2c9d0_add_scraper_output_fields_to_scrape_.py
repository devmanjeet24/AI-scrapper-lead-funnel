"""add scraper output fields to scrape_results

Revision ID: b7e4f1a2c9d0
Revises: a8f3c2d1e4b5
Create Date: 2026-06-24 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "b7e4f1a2c9d0"
down_revision: Union[str, Sequence[str], None] = "a8f3c2d1e4b5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("scrape_results", sa.Column("page_title", sa.String(length=512), nullable=True))
    op.add_column("scrape_results", sa.Column("raw_html", sa.Text(), nullable=True))
    op.add_column(
        "scrape_results",
        sa.Column("extracted_data", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("scrape_results", "extracted_data")
    op.drop_column("scrape_results", "raw_html")
    op.drop_column("scrape_results", "page_title")
