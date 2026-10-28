"""
Valuation Schemas — Pydantic v2
================================
Input / output contracts for the valuation API.
"""

from __future__ import annotations

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
import datetime


# ─── Enums (mirrored from models) ─────────────────────────────────────────────

VALID_STAGES = ["idea", "pre_seed", "seed", "series_a", "series_b", "series_c_plus"]
VALID_BUSINESS_MODELS = ["saas", "marketplace", "ecommerce", "fintech", "edtech", "healthtech", "other"]


# ─── Step Input Schemas ───────────────────────────────────────────────────────

class StartupProfileInput(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)

    name:           str = Field(..., min_length=1, max_length=200, description="Startup name")
    industry:       str = Field(..., min_length=1, max_length=100)
    country:        str = Field(..., min_length=1, max_length=100)
    founded_year:   int = Field(..., ge=1980, le=datetime.date.today().year)
    business_model: str = Field(..., description="One of: " + ", ".join(VALID_BUSINESS_MODELS))
    stage:          str = Field(..., description="One of: " + ", ".join(VALID_STAGES))

    @field_validator("stage")
    @classmethod
    def validate_stage(cls, v: str) -> str:
        if v not in VALID_STAGES:
            raise ValueError(f"stage must be one of: {', '.join(VALID_STAGES)}")
        return v

    @field_validator("business_model")
    @classmethod
    def validate_business_model(cls, v: str) -> str:
        if v not in VALID_BUSINESS_MODELS:
            raise ValueError(f"business_model must be one of: {', '.join(VALID_BUSINESS_MODELS)}")
        return v

    @field_validator("name", "industry", "country")
    @classmethod
    def validate_non_blank(cls, v: str) -> str:
        value = v.strip()
        if not value:
            raise ValueError("must not be blank")
        return value


class FinancialMetricsInput(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)

    annual_revenue:       float = Field(0.0, ge=0, description="Annual revenue in INR")
    mrr:                  float = Field(0.0, ge=0, description="Monthly recurring revenue in INR")
    revenue_growth_yoy:   float = Field(0.0, ge=-100, le=10000, description="Year-over-year growth %")
    gross_margin:         float = Field(0.0, ge=-100, le=100, description="Gross margin %")
    monthly_opex:         float = Field(0.0, ge=0, description="Monthly operating expenses in INR")
    monthly_burn:         float = Field(0.0, ge=0, description="Monthly burn rate in INR")
    cash_available:       float = Field(0.0, ge=0, description="Cash available in INR")
    total_funding_raised: float = Field(0.0, ge=0, description="Total funding raised in INR")


class BusinessMetricsInput(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)

    total_customers:      int   = Field(0, ge=0)
    monthly_active_users: int   = Field(0, ge=0)
    cac:                  float = Field(0.0, ge=0, description="Customer acquisition cost in INR")
    ltv:                  float = Field(0.0, ge=0, description="Customer lifetime value in INR")
    churn_rate:           float = Field(0.0, ge=0, le=100, description="Monthly churn rate %")
    arpu:                 float = Field(0.0, ge=0, description="Average revenue per user/customer in INR")


class MarketMetricsInput(BaseModel):
    model_config = ConfigDict(allow_inf_nan=False)

    tam:                   float = Field(0.0, ge=0, description="Total addressable market in INR crore")
    sam:                   float = Field(0.0, ge=0, description="Serviceable addressable market in INR crore")
    som:                   float = Field(0.0, ge=0, description="Serviceable obtainable market in INR crore")
    market_growth:         float = Field(0.0, ge=-100, le=1000, description="Market growth rate %")
    num_competitors:       int   = Field(0, ge=0)
    competitive_advantage: str   = Field("", max_length=1000)

    @model_validator(mode="after")
    def validate_market_sizes(self) -> "MarketMetricsInput":
        if self.tam < self.sam:
            raise ValueError("tam must be greater than or equal to sam")
        if self.sam < self.som:
            raise ValueError("sam must be greater than or equal to som")
        return self


# ─── Combined Request Schema ──────────────────────────────────────────────────

class ValuationRequest(BaseModel):
    """Full valuation calculation request — all 4 form steps combined."""
    profile:    StartupProfileInput
    financials: FinancialMetricsInput
    business:   BusinessMetricsInput
    market:     MarketMetricsInput


# ─── Output Schemas ───────────────────────────────────────────────────────────

class MethodResult(BaseModel):
    method_name:  str
    value_crore:  Optional[float]  = None
    weight:       float            = 0.0
    applicable:   bool             = True
    note:         str              = ""


class ScoreBreakdown(BaseModel):
    score:       float  = Field(..., ge=0, le=100)
    label:       str    = ""
    components:  Dict[str, float] = {}


class ValuationResponse(BaseModel):
    """Response from POST /api/valuation/calculate"""

    # IDs
    startup_id:   int
    valuation_id: int

    # Range (in INR crore)
    valuation_low:  float
    valuation_base: float
    valuation_high: float
    currency:       str = "INR crore"

    # Scores (0-100)
    financial_health_score:   float
    growth_score:             float
    investor_readiness_score: float

    # Derived
    cash_runway_months: Optional[float] = None
    ltv_cac_ratio:      Optional[float] = None

    # Detailed breakdowns
    method_breakdown: List[MethodResult]
    strengths:        List[str]
    risks:            List[str]

    # AI / Rule-based analysis
    ai_analysis: Dict[str, Any]

    # Meta
    is_pre_revenue: bool
    disclaimer:     str
    assumptions:    Dict[str, Any]
