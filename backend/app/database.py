import logging
import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("smart_campus.database")

BASE_DIR = Path(__file__).resolve().parent.parent

# Read .env if present
env_file = BASE_DIR / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'\""))

DB_PATH = (BASE_DIR / "campus_lost_found.db").resolve()
SQLITE_URL = f"sqlite:///{DB_PATH}"

configured_url = os.getenv("DATABASE_URL", SQLITE_URL)

# Normalize postgres URL to use psycopg2 driver if available to prevent Windows psycopg3 DNS resolution issues
if configured_url.startswith("postgres://"):
    configured_url = configured_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif configured_url.startswith("postgresql://") and not configured_url.startswith("postgresql+"):
    configured_url = configured_url.replace("postgresql://", "postgresql+psycopg2://", 1)

SQLALCHEMY_DATABASE_URL = configured_url


def build_engine(url: str):
    is_sqlite = "sqlite" in url
    return create_engine(
        url,
        connect_args={"check_same_thread": False} if is_sqlite else {"connect_timeout": 15},
        pool_pre_ping=True,
    )


# Initialize database engine with automatic fallback to local SQLite if remote is unreachable
engine = build_engine(SQLALCHEMY_DATABASE_URL)
if "sqlite" not in SQLALCHEMY_DATABASE_URL:
    try:
        with engine.connect() as test_conn:
            test_conn.execute(text("SELECT 1"))
        logger.info(f"Database connected successfully to {SQLALCHEMY_DATABASE_URL.split('@')[-1]}")
    except Exception as exc:
        logger.warning(
            f"Unable to connect to remote PostgreSQL ({exc}). "
            f"Falling back to local SQLite at {DB_PATH}"
        )
        SQLALCHEMY_DATABASE_URL = SQLITE_URL
        engine = build_engine(SQLITE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
