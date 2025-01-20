"""add:takin username

Revision ID: 514d4d9c634f
Revises: 01d6889832f7
Create Date: 2024-12-16 10:23:47.184913

"""
from alembic import op
import models as models
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '514d4d9c634f'
down_revision = '01d6889832f7'
branch_labels = None
depends_on = None


def upgrade():
    # messages 表处理
    with op.batch_alter_table('messages', schema=None) as batch_op:
        # 确保 created_at 列不为空
        op.execute("UPDATE messages SET created_at = NOW() WHERE created_at IS NULL")


    # recommended_apps 表处理
    with op.batch_alter_table('recommended_apps', schema=None) as batch_op:
        # 确保 custom_disclaimer 列不为空
        op.execute("UPDATE recommended_apps SET custom_disclaimer = '' WHERE custom_disclaimer IS NULL")
        batch_op.alter_column('custom_disclaimer',
               existing_type=sa.VARCHAR(length=255),
               type_=sa.TEXT(),
               nullable=False,
               server_default='')
       

    # sites 表处理
    with op.batch_alter_table('sites', schema=None) as batch_op:
        # 确保 custom_disclaimer 列不为空
        op.execute("UPDATE sites SET custom_disclaimer = '' WHERE custom_disclaimer IS NULL")
        batch_op.alter_column('custom_disclaimer',
               existing_type=sa.VARCHAR(length=255),
               type_=sa.TEXT(),
               nullable=False,
               server_default='')
  

    # tool_api_providers 表处理
    with op.batch_alter_table('tool_api_providers', schema=None) as batch_op:
        # 确保 custom_disclaimer 列不为空
        op.execute("UPDATE tool_api_providers SET custom_disclaimer = '' WHERE custom_disclaimer IS NULL")
        batch_op.alter_column('custom_disclaimer',
               existing_type=sa.VARCHAR(length=255),
               type_=sa.TEXT(),
               nullable=False,
               server_default='')
       
    # upload_files 表处理
    with op.batch_alter_table('upload_files', schema=None) as batch_op:
        # source_url 列已经在之前的迁移中添加过了，所以这里跳过
        pass

    # workflow_runs 表处理
    with op.batch_alter_table('workflow_runs', schema=None) as batch_op:
        # 确保 outputs 列不为空
        op.execute("UPDATE workflow_runs SET outputs = '' WHERE outputs IS NULL")
        batch_op.alter_column('outputs',
               existing_type=sa.TEXT(),
               nullable=False,
               server_default='')

    # workflows 表处理
    with op.batch_alter_table('workflows', schema=None) as batch_op:
        # 确保 updated_at 列不为空
        op.execute("UPDATE workflows SET updated_at = NOW() WHERE updated_at IS NULL")
        batch_op.alter_column('updated_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=False,
               server_default=sa.text('NOW()'))

def downgrade():
    def safe_drop_index(index_name):
        try:
            op.execute(f'DROP INDEX IF EXISTS {index_name}')
        except Exception as e:
            print(f"Warning: Failed to drop index {index_name}: {str(e)}")

    # workflows 表处理
    with op.batch_alter_table('workflows', schema=None) as batch_op:
        batch_op.alter_column('updated_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=True)

    # workflow_runs 表处理
    with op.batch_alter_table('workflow_runs', schema=None) as batch_op:
        batch_op.alter_column('outputs',
               existing_type=sa.TEXT(),
               nullable=True)

    # upload_files 表处理
    with op.batch_alter_table('upload_files', schema=None) as batch_op:
        batch_op.drop_column('source_url')

    # tool_api_providers 表处理
    with op.batch_alter_table('tool_api_providers', schema=None) as batch_op:
        batch_op.drop_column('publish')
        batch_op.alter_column('custom_disclaimer',
               existing_type=sa.TEXT(),
               type_=sa.VARCHAR(length=255),
               nullable=True)

    # sites 表处理
    with op.batch_alter_table('sites', schema=None) as batch_op:
        safe_drop_index('site_app_id_idx')
        safe_drop_index('site_code_idx')
        batch_op.alter_column('custom_disclaimer',
               existing_type=sa.TEXT(),
               type_=sa.VARCHAR(length=255),
               nullable=True)

    # recommended_apps 表处理
    with op.batch_alter_table('recommended_apps', schema=None) as batch_op:
        safe_drop_index('recommended_app_app_id_idx')
        safe_drop_index('recommended_app_is_listed_idx')
        batch_op.alter_column('custom_disclaimer',
               existing_type=sa.TEXT(),
               type_=sa.VARCHAR(length=255),
               nullable=True)

    # messages 表处理
    with op.batch_alter_table('messages', schema=None) as batch_op:
        safe_drop_index('message_created_at_idx')
