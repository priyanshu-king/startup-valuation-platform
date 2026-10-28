"""
SQLAlchemy Declarative Base
============================
All ORM models must inherit from Base defined here so that
metadata.create_all() picks them up correctly.
"""

from sqlalchemy.orm import DeclarativeBase, MappedColumn, mapped_column
from sqlalchemy import Integer
import datetime
from sqlalchemy import DateTime
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


class TimestampMixin:
    """
    Mixin that adds created_at / updated_at columns to any model.
    Usage:
        class MyModel(TimestampMixin, Base):
            ...
    """
    created_at: MappedColumn[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: MappedColumn[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
