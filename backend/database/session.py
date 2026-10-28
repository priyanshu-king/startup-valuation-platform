"""
Database Session & Initialization
===================================
Provides:
- AsyncEngine and AsyncSession factory
- init_db() — creates all tables on startup
- get_db() — FastAPI dependency for request-scoped sessions

Local development uses SQLite (``sqlite+aiosqlite``); production can point
``DATABASE_URL`` at a hosted PostgreSQL instance (Neon, Supabase, Vercel
Postgres, …). Both drivers are supported transparently.
"""

import asyncio
import logging
from pathlib import Path
from urllib.parse import urlsplit

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from core.config import settings

logger = logging.getLogger(__name__)

# ─── URL Normalisation ──────────────────────────────────────────────────────

_LOCAL_HOSTS = {"", "localhost", "127.0.0.1", "::1"}


def normalise_database_url(raw_url: str) -> str:
    """Return an async-driver SQLAlchemy URL for SQLite or PostgreSQL.

    Accepts the plain URLs handed out by hosting providers
    (``postgres://…``, ``postgresql://…``, ``sqlite:///…``) and rewrites
    them to the async driver equivalents (``asyncpg`` / ``aiosqlite``).
    """
    url = (raw_url or "").strip()
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]
    if url.startswith("sqlite:///"):
        url = url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
    return url


_DATABASE_URL = normalise_database_url(settings.DATABASE_URL)
_IS_SQLITE = _DATABASE_URL.startswith("sqlite")


# ─── SQLite: ensure the data directory exists ───────────────────────────────

if _IS_SQLITE:
    _db_path = _DATABASE_URL.replace("sqlite+aiosqlite:///", "", 1).split("?", 1)[0]
    if _db_path and _db_path != ":memory:":
        Path(_db_path).parent.mkdir(parents=True, exist_ok=True)


# ─── Connection arguments ───────────────────────────────────────────────────


def _postgres_connect_args() -> dict:
    """Connection options that work with serverless connection poolers."""
    host = urlsplit(
        _DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)
    ).hostname or ""
    args: dict = {
        # Serverless functions should not reuse prepared statements or hold
        # pooled connections between invocations (see NullPool below).
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    }
    if host not in _LOCAL_HOSTS:
        args["ssl"] = "require"
    return args


# ─── Engine ─────────────────────────────────────────────────────────────────
engine = create_async_engine(
    _DATABASE_URL,
    echo=False,                    # SQL parameters may contain confidential financial inputs.
    poolclass=None if _IS_SQLITE else NullPool,
    connect_args={"check_same_thread": False} if _IS_SQLITE else _postgres_connect_args(),
)

# ─── Session Factory ────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ─── Table Initialisation ───────────────────────────────────────────────────

async def init_db() -> None:
    """Create all database tables if they don't exist."""
    # Import all models so their metadata is registered before create_all.
    from models import base  # noqa: F401  (triggers model imports)

    async with engine.begin() as conn:
        await conn.run_sync(base.Base.metadata.create_all)

        # Legacy SQLite files created before ``assumptions_json`` existed need
        # the column added manually; ``create_all`` does not alter tables.
        if conn.dialect.name == "sqlite":
            columns = await conn.exec_driver_sql("PRAGMA table_info(valuation_results)")
            if "assumptions_json" not in {row[1] for row in columns}:
                await conn.execute(text(
                    "ALTER TABLE valuation_results "
                    "ADD COLUMN assumptions_json TEXT NOT NULL DEFAULT '{}'"
                ))


_schema_ready = False


async def ensure_schema() -> None:
    """Initialise the schema once per process (serverless-safe).

    ``init_db`` already runs from the application lifespan. This helper makes
    the first request resilient on platforms that do not run ASGI lifespan
    events, and retries transient failures while a hosted database wakes up.
    """
    global _schema_ready
    if _schema_ready:
        return

    last_error: Exception | None = None
    for attempt in range(3):
        try:
            await init_db()
            _schema_ready = True
            return
        except Exception as exc:  # pragma: no cover - depends on remote DB
            last_error = exc
            logger.warning("Database initialisation attempt %s failed: %s", attempt + 1, exc)
            await asyncio.sleep(1 + attempt)
    assert last_error is not None
    raise last_error


# ─── FastAPI Dependency ──────────────────────────────────────────────────────

async def get_db() -> AsyncSession:  # type: ignore[override]
    """
    Yield a database session for the duration of a request,
    then close it automatically.
    """
    await ensure_schema()
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
