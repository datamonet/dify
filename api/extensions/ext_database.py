import os

import dotenv
from flask_sqlalchemy import SQLAlchemy
from pymongo import MongoClient
from sqlalchemy import MetaData

dotenv.load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
mongodb = client.get_database(os.getenv("MONGODB_NAME"))
collection = mongodb["users"]

POSTGRES_INDEXES_NAMING_CONVENTION = {
    "ix": "%(column_0_label)s_idx",
    "uq": "%(table_name)s_%(column_0_name)s_key",
    "ck": "%(table_name)s_%(constraint_name)s_check",
    "fk": "%(table_name)s_%(column_0_name)s_fkey",
    "pk": "%(table_name)s_pkey",
}

metadata = MetaData(naming_convention=POSTGRES_INDEXES_NAMING_CONVENTION)
db = SQLAlchemy(metadata=metadata)


def init_app(app):
    db.init_app(app)
