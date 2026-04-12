from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from ai_service.app.core.config import settings

# pool_pre_ping helps recycle stale MySQL connections in long-running services.
engine = create_engine(settings.sqlalchemy_database_uri, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

