# pylint: disable=no-member
# pyright: reportAttributeAccessIssue=false
"""Add generations table.

Revision ID: 003
Revises: 002
Create Date: 2026-06-29

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, Sequence[str], None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "generations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("style", sa.String(length=50), nullable=True),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("image_path", sa.String(length=500), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_generations_user_id"), "generations", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_generations_user_id"), table_name="generations")
    op.drop_table("generations")
