"""add_beta_requests_table

Revision ID: 1dd9669e87ea
Revises: 024dfe776d88
Create Date: 2026-06-29 07:50:39.346413

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1dd9669e87ea'
down_revision: Union[str, Sequence[str], None] = '024dfe776d88'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'beta_requests',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True, autoincrement=True),
        sa.Column('tg_username', sa.String(length=32), nullable=False, index=True),
        sa.Column('plan_name', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False)
    )

def downgrade() -> None:
    op.drop_table('beta_requests')
