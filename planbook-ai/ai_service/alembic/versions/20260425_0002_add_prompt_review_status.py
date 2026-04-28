"""add prompt review status

Revision ID: 20260425_0002
Revises: 20260420_0001
Create Date: 2026-04-25 00:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260425_0002"
down_revision = "20260420_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "prompts",
        sa.Column("approval_status", sa.String(length=30), nullable=False, server_default="APPROVED"),
    )
    op.add_column("prompts", sa.Column("review_note", sa.Text(), nullable=True))
    op.add_column("prompts", sa.Column("reviewed_by", sa.String(length=100), nullable=True))
    op.add_column("prompts", sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True))

    op.create_index(
        op.f("ix_prompts_approval_status"),
        "prompts",
        ["approval_status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_prompts_approval_status"), table_name="prompts")
    op.drop_column("prompts", "reviewed_at")
    op.drop_column("prompts", "reviewed_by")
    op.drop_column("prompts", "review_note")
    op.drop_column("prompts", "approval_status")
