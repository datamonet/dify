from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

from dify_app import DifyApp

POSTGRES_INDEXES_NAMING_CONVENTION = {
    "ix": "%(column_0_label)s_idx",
    "uq": "%(table_name)s_%(column_0_name)s_key",
    "ck": "%(table_name)s_%(constraint_name)s_check",
    "fk": "%(table_name)s_%(column_0_name)s_fkey",
    "pk": "%(table_name)s_pkey",
}

metadata = MetaData(naming_convention=POSTGRES_INDEXES_NAMING_CONVENTION)
db = SQLAlchemy(metadata=metadata)


def init_app(app: DifyApp):
    db.init_app(app)

# takin command:链接数据库




import os
import dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

dotenv.load_dotenv()

# Create a separate PostgreSQL connection
postgres_engine = create_engine(os.getenv("POSTGRES_URI"))
PostgresSession = sessionmaker(bind=postgres_engine)
postgres_session = PostgresSession()
