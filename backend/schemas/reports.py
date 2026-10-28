"""Persisted report response contracts."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ReportSummary(BaseModel):
    report_id: int
    valuation_id: int
    company_name: str
    generated_at: datetime
    valuation_low: float
    valuation_base: float
    valuation_high: float
    currency: str
    status: str


class ReportDetail(ReportSummary):
    profile: dict[str, Any]
    financials: dict[str, Any]
    business: dict[str, Any]
    market: dict[str, Any]
    method_breakdown: list[dict[str, Any]]
    strengths: list[str]
    risks: list[str]
    assumptions: dict[str, Any]
    scores: dict[str, float]
    cash_runway_months: float | None
    ltv_cac_ratio: float | None
    is_pre_revenue: bool
    disclaimer: str
