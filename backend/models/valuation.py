"""
ORM Models — Startup Profile & Valuation Result
=================================================
Stored in SQLite via SQLAlchemy async.
"""

import json
from sqlalchemy import String, Float, Integer, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
import enum

from models.base import Base, TimestampMixin


# ─── Enumerations ────────────────────────────────────────────────────────────

class StartupStage(str, enum.Enum):
    IDEA       = "idea"
    PRE_SEED   = "pre_seed"
    SEED       = "seed"
    SERIES_A   = "series_a"
    SERIES_B   = "series_b"
    SERIES_C_PLUS = "series_c_plus"


class BusinessModel(str, enum.Enum):
    SAAS       = "saas"
    MARKETPLACE = "marketplace"
    ECOMMERCE  = "ecommerce"
    FINTECH    = "fintech"
    EDTECH     = "edtech"
    HEALTHTECH = "healthtech"
    OTHER      = "other"


# ─── Startup Profile Model ────────────────────────────────────────────────────

class StartupProfile(TimestampMixin, Base):
    """
    Persists one startup's profile and submitted metrics.
    Each form submission creates a new row.
    """
    __tablename__ = "startup_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    owner_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True,
    )

    # ── Step 1: Startup Profile ──────────────────────────────
    name:           Mapped[str]  = mapped_column(String(200), nullable=False)
    industry:       Mapped[str]  = mapped_column(String(100), nullable=False)
    country:        Mapped[str]  = mapped_column(String(100), nullable=False)
    founded_year:   Mapped[int]  = mapped_column(Integer, nullable=False)
    business_model: Mapped[str]  = mapped_column(String(50), nullable=False)
    stage:          Mapped[str]  = mapped_column(String(30), nullable=False)

    # ── Step 2: Financial Metrics ────────────────────────────
    annual_revenue:        Mapped[float] = mapped_column(Float, default=0.0)
    mrr:                   Mapped[float] = mapped_column(Float, default=0.0)
    revenue_growth_yoy:    Mapped[float] = mapped_column(Float, default=0.0)   # %
    gross_margin:          Mapped[float] = mapped_column(Float, default=0.0)   # %
    monthly_opex:          Mapped[float] = mapped_column(Float, default=0.0)
    monthly_burn:          Mapped[float] = mapped_column(Float, default=0.0)
    cash_available:        Mapped[float] = mapped_column(Float, default=0.0)
    total_funding_raised:  Mapped[float] = mapped_column(Float, default=0.0)

    # ── Step 3: Business Metrics ─────────────────────────────
    total_customers:       Mapped[int]   = mapped_column(Integer, default=0)
    monthly_active_users:  Mapped[int]   = mapped_column(Integer, default=0)
    cac:                   Mapped[float] = mapped_column(Float, default=0.0)   # ₹
    ltv:                   Mapped[float] = mapped_column(Float, default=0.0)   # ₹
    churn_rate:            Mapped[float] = mapped_column(Float, default=0.0)   # % monthly
    arpu:                  Mapped[float] = mapped_column(Float, default=0.0)   # ₹

    # ── Step 4: Market Metrics ───────────────────────────────
    tam:                   Mapped[float] = mapped_column(Float, default=0.0)   # ₹ crore
    sam:                   Mapped[float] = mapped_column(Float, default=0.0)
    som:                   Mapped[float] = mapped_column(Float, default=0.0)
    market_growth:         Mapped[float] = mapped_column(Float, default=0.0)   # %
    num_competitors:       Mapped[int]   = mapped_column(Integer, default=0)
    competitive_advantage: Mapped[str]  = mapped_column(Text, default="")


# ─── Valuation Result Model ───────────────────────────────────────────────────

class ValuationResult(TimestampMixin, Base):
    """
    Stores the computed valuation result for a startup profile.
    JSON fields hold the detailed breakdowns.
    """
    __tablename__ = "valuation_results"

    id:                 Mapped[int]   = mapped_column(Integer, primary_key=True, autoincrement=True)
    startup_profile_id: Mapped[int]   = mapped_column(Integer, nullable=False, index=True)
    owner_id:            Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True,
    )

    # ── Valuation Range ──────────────────────────────────────
    valuation_low:      Mapped[float] = mapped_column(Float, nullable=False)
    valuation_base:     Mapped[float] = mapped_column(Float, nullable=False)
    valuation_high:     Mapped[float] = mapped_column(Float, nullable=False)
    currency:           Mapped[str]   = mapped_column(String(10), default="INR_CRORE")

    # ── Scores ───────────────────────────────────────────────
    financial_health_score:   Mapped[float] = mapped_column(Float, default=0.0)
    growth_score:             Mapped[float] = mapped_column(Float, default=0.0)
    investor_readiness_score: Mapped[float] = mapped_column(Float, default=0.0)

    # ── Derived Metrics ──────────────────────────────────────
    cash_runway_months: Mapped[float] = mapped_column(Float, default=0.0)
    ltv_cac_ratio:      Mapped[float] = mapped_column(Float, default=0.0)

    # ── Method Breakdown (JSON stored as text) ───────────────
    method_breakdown_json: Mapped[str] = mapped_column(Text, default="{}")
    strengths_json:        Mapped[str] = mapped_column(Text, default="[]")
    risks_json:            Mapped[str] = mapped_column(Text, default="[]")
    ai_analysis_json:      Mapped[str] = mapped_column(Text, default="{}")
    assumptions_json:      Mapped[str] = mapped_column(Text, default="{}")

    is_pre_revenue: Mapped[bool] = mapped_column(Boolean, default=False)
    disclaimer:     Mapped[str]  = mapped_column(Text, default="")
