"""merge version v0.8

Revision ID: a93389dbd8e9
Revises: cf8f4fc45278, 514d4d9c634f
Create Date: 2024-12-18 17:11:55.906850

"""
from alembic import op
import models as models
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a93389dbd8e9'
down_revision = ('cf8f4fc45278', '514d4d9c634f')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
