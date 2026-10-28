"""
Database Session & Initialization
===================================
Provides:
- AsyncEngine and AsyncSession factory
- init_db() — creates all tables on startup
- get_db() — FastAPI dependency for request-scoped sessions
"""

import os
from pathlib import Path

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy import text

from core.config import settings

# ─── Ensure the data directory exists ───────────────────────────────────────
_db_path = settings.DATABASE_URL.replace("sqlite:///", "")
Path(_db_path).parent.mkdir(parents=True, exist_ok=True)

# ─── Convert sync SQLite URL to async ───────────────────────────────────────
# SQLAlchemy async requires aiosqlite driver.
_async_url = settings.DATABASE_URL.replace(
    "sqlite:///", "sqlite+aiosqlite:///"
)

# ─── Engine ─────────────────────────────────────────────────────────────────
engine = create_async_engine(
    _async_url,
    echo=False,                    # SQL parameters may contain confidential financial inputs.
    connect_args={"check_same_thread": False},
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
        columns = await conn.exec_driver_sql("PRAGMA table_info(valuation_results)")
        if "assumptions_json" not in {row[1] for row in columns}:
            await conn.execute(text(
                "ALTER TABLE valuation_results "
                "ADD COLUMN assumptions_json TEXT NOT NULL DEFAULT '{}'"
            ))


# ─── FastAPI Dependency ──────────────────────────────────────────────────────

async def get_db() -> AsyncSession:  # type: ignore[override]
    """
    Yield a database session for the duration of a request,
    then close it automatically.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
