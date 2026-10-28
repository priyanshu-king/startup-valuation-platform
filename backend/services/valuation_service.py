"""
Valuation Engine
================
Transparent, mathematical startup valuation.

All methods document their assumptions explicitly.
No LLM is used to invent numbers — the LLM only narrates the output.

Currency: INR crore (1 crore = 10 million INR ≈ ~120,000 USD at ₹83/$)

Methods implemented:
  1. Revenue Multiple        — ARR × industry multiple
  2. Growth-Adjusted         — adjusts multiple for growth rate
  3. LTV/CAC Economics       — unit economics quality signal
  4. Market Penetration      — SOM-based ceiling sanity check

Scores:
  - Financial Health  (0–100)
  - Growth Score      (0–100)
  - Investor Readiness(0–100)
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple

from schemas.valuation import (
    ValuationRequest,
    MethodResult,
    ValuationResponse,
)


# ─── Configurable Assumptions (documented) ────────────────────────────────────

# Revenue multiples by stage (ARR multiple — illustrative model assumptions,
# not market observations or sourced comparable-company data).
STAGE_REVENUE_MULTIPLES: Dict[str, float] = {
    "idea":           0.0,   # Pre-revenue: use alternative methods only
    "pre_seed":       1.5,
    "seed":           3.0,
    "series_a":       5.0,
    "series_b":       7.0,
    "series_c_plus":  9.0,
}

# Growth rate adjustments (additional multiple per 10% above 30% baseline growth)
GROWTH_PREMIUM_PER_10PCT = 0.3

# Pre-revenue startup base value (Berkus-inspired, in INR crore)
PRE_REVENUE_BASE = 1.0      # ₹1 Cr base for idea stage
PRE_REVENUE_MAX  = 5.0      # ₹5 Cr max for very strong idea-stage signal

# Discount rate for risk adjustments
BASE_DISCOUNT = 0.10   # 10% risk haircut on high scenario

INR_CRORE = 1.0        # All values are already in INR crore in outputs


def _safe_div(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Division that never raises ZeroDivisionError."""
    if denominator == 0 or math.isnan(denominator) or math.isinf(denominator):
        return default
    result = numerator / denominator
    if math.isnan(result) or math.isinf(result):
        return default
    return result


def _to_crore(inr: float) -> float:
    """Convert raw INR to INR crore."""
    return inr / 1_00_00_000   # 1 crore = 10,000,000


class ValuationEngine:
    """
    Transparent, explainable startup valuation engine.
    Call compute() with a ValuationRequest to get a full ValuationResponse.
    """

    def compute(self, req: ValuationRequest) -> Dict[str, Any]:
        profile    = req.profile
        financials = req.financials
        business   = req.business
        market     = req.market

        # Detect pre-revenue situation
        is_pre_revenue = (financials.annual_revenue <= 0 and financials.mrr <= 0)

        # Normalise ARR (use annual_revenue if provided, else MRR × 12)
        arr_inr = financials.annual_revenue if financials.annual_revenue > 0 else (financials.mrr * 12)
        arr_crore = _to_crore(arr_inr)

        methods: List[MethodResult] = []
        valuations: List[float] = []

        # ─── Method 1: Revenue Multiple ──────────────────────────────────────
        rev_method = self._revenue_multiple(profile.stage, arr_crore, is_pre_revenue)
        methods.append(rev_method)
        if rev_method.applicable and rev_method.value_crore is not None:
            valuations.append(rev_method.value_crore)

        # ─── Method 2: Growth-Adjusted Multiple ──────────────────────────────
        growth_method = self._growth_adjusted(
            profile.stage, arr_crore,
            financials.revenue_growth_yoy,
            is_pre_revenue
        )
        methods.append(growth_method)
        if growth_method.applicable and growth_method.value_crore is not None:
            valuations.append(growth_method.value_crore)

        # ─── Method 3: Pre-Revenue / Berkus-inspired ─────────────────────────
        if is_pre_revenue:
            berkus = self._berkus_estimate(profile, business, market)
            methods.append(berkus)
            if berkus.value_crore is not None:
                valuations.append(berkus.value_crore)
        else:
            methods.append(MethodResult(
                method_name="Pre-Revenue Estimate",
                applicable=False,
                note="Not applicable — startup has revenue.",
            ))

        # ─── Method 4: Market Penetration Ceiling ────────────────────────────
        market_method = self._market_ceiling(market.som, valuations)
        methods.append(market_method)
        # Market ceiling is a sanity check, not added to valuation pool directly

        # ─── Composite Valuation ─────────────────────────────────────────────
        if not valuations:
            # Absolute fallback — very limited data
            base = PRE_REVENUE_BASE
        else:
            base = sum(valuations) / len(valuations)

        # Apply market ceiling sanity check
        som_crore = market.som  # already in crore per schema
        if som_crore > 0:
            ceiling = som_crore * 0.25   # max 25% of SOM as valuation
            if base > ceiling:
                base = ceiling
                for m in methods:
                    if m.method_name == "Market Penetration Ceiling":
                        m.note += " (ceiling applied)"

        low  = base * 0.75
        high = base * 1.35

        # ─── Scores ──────────────────────────────────────────────────────────
        financial_health = self._financial_health_score(financials, business)
        growth_score     = self._growth_score(financials, business)
        investor_ready   = self._investor_readiness_score(
            profile, financials, business, market, financial_health, growth_score
        )

        # ─── Derived Metrics ─────────────────────────────────────────────────
        runway_months: Optional[float] = None
        if financials.monthly_burn > 0 and financials.cash_available > 0:
            runway_months = _safe_div(financials.cash_available, financials.monthly_burn)

        ltv_cac: Optional[float] = None
        if business.cac > 0 and business.ltv > 0:
            ltv_cac = _safe_div(business.ltv, business.cac)

        # ─── Strengths & Risks ────────────────────────────────────────────────
        strengths, risks = self._generate_flags(
            profile, financials, business, market,
            financial_health, growth_score, runway_months, ltv_cac
        )

        disclaimer = (
            "This is a model-based estimate using configurable revenue multiples and growth "
            "adjustments. It is NOT a certified financial appraisal, investment advice, or "
            "guarantee of future value. Consult a qualified financial advisor before making "
            "investment decisions."
        )

        assumptions = {
            "stage_revenue_multiple":    STAGE_REVENUE_MULTIPLES.get(profile.stage, 0),
            "growth_premium_per_10pct":  GROWTH_PREMIUM_PER_10PCT,
            "pre_revenue_base_crore":    PRE_REVENUE_BASE,
            "valuation_formula": (
                "Base is the simple average of applicable valuation methods; "
                "when SOM is provided, base is capped at 25% of SOM. "
                "Low = 75% of base; high = 135% of base."
            ),
            "currency":                  "INR crore (1 Cr = ₹1,00,00,000)",
            "arr_used_crore":            round(arr_crore, 4),
            "is_pre_revenue":            is_pre_revenue,
            "note": (
                "Revenue multiples are illustrative configurable model assumptions. "
                "No external market comparable or certified transaction data is used."
            ),
        }

        return {
            "valuation_low":              round(low, 2),
            "valuation_base":             round(base, 2),
            "valuation_high":             round(high, 2),
            "currency":                   "INR crore",
            "financial_health_score":     round(financial_health, 1),
            "growth_score":               round(growth_score, 1),
            "investor_readiness_score":   round(investor_ready, 1),
            "cash_runway_months":         round(runway_months, 1) if runway_months is not None else None,
            "ltv_cac_ratio":              round(ltv_cac, 2) if ltv_cac is not None else None,
            "method_breakdown":           [m.model_dump() for m in methods],
            "strengths":                  strengths,
            "risks":                      risks,
            "is_pre_revenue":             is_pre_revenue,
            "disclaimer":                 disclaimer,
            "assumptions":                assumptions,
        }

    # ─── Method Implementations ───────────────────────────────────────────────

    def _revenue_multiple(
        self, stage: str, arr_crore: float, is_pre_revenue: bool
    ) -> MethodResult:
        if is_pre_revenue:
            return MethodResult(
                method_name="Revenue Multiple",
                applicable=False,
                weight=0.0,
                note="Not applicable — pre-revenue startup.",
            )
        multiple = STAGE_REVENUE_MULTIPLES.get(stage, 3.0)
        value = arr_crore * multiple
        return MethodResult(
            method_name="Revenue Multiple",
            value_crore=round(value, 2),
            weight=0.40,
            applicable=True,
            note=(
                f"ARR ₹{arr_crore:.2f} Cr × {multiple}x illustrative {stage} multiple. "
                "Multiple is a configurable assumption, not from certified comps."
            ),
        )

    def _growth_adjusted(
        self, stage: str, arr_crore: float, growth_pct: float, is_pre_revenue: bool
    ) -> MethodResult:
        if is_pre_revenue:
            return MethodResult(
                method_name="Growth-Adjusted Valuation",
                applicable=False,
                note="Not applicable — pre-revenue startup.",
            )
        base_multiple = STAGE_REVENUE_MULTIPLES.get(stage, 3.0)
        # Add premium for growth above 30%
        growth_premium = max(0, (growth_pct - 30) / 10) * GROWTH_PREMIUM_PER_10PCT
        adjusted_multiple = base_multiple + growth_premium
        value = arr_crore * adjusted_multiple
        return MethodResult(
            method_name="Growth-Adjusted Valuation",
            value_crore=round(value, 2),
            weight=0.40,
            applicable=True,
            note=(
                f"Adjusted multiple: {adjusted_multiple:.2f}x "
                f"(base {base_multiple}x + {growth_premium:.2f}x growth premium for {growth_pct:.0f}% YoY growth)."
            ),
        )

    def _berkus_estimate(
        self, profile: Any, business: Any, market: Any
    ) -> MethodResult:
        """
        Berkus-inspired scoring for pre-revenue startups.
        Each element adds up to ₹1 Cr toward the estimate.
        Max estimate: ₹5 Cr.
        """
        score = PRE_REVENUE_BASE  # Start at base
        factors = []

        if profile.stage in ("seed", "pre_seed"):
            score += 0.5
            factors.append("Progressed beyond idea stage (+0.5 Cr)")

        if market.tam > 1000:  # TAM > ₹1000 Cr
            score += 0.75
            factors.append("Large TAM (>₹1000 Cr) (+0.75 Cr)")
        elif market.tam > 100:
            score += 0.3
            factors.append("Moderate TAM (>₹100 Cr) (+0.3 Cr)")

        if business.total_customers > 0:
            score += 0.5
            factors.append(f"Early customers ({business.total_customers}) (+0.5 Cr)")

        if len(market.competitive_advantage) > 50:
            score += 0.25
            factors.append("Described competitive advantage (+0.25 Cr)")

        score = min(score, PRE_REVENUE_MAX)
        return MethodResult(
            method_name="Pre-Revenue Estimate (Berkus-Inspired)",
            value_crore=round(score, 2),
            weight=1.0,
            applicable=True,
            note="Pre-revenue scoring based on stage, market size, and traction signals. Max ₹5 Cr. " + "; ".join(factors),
        )

    def _market_ceiling(self, som_crore: float, valuations: List[float]) -> MethodResult:
        if som_crore <= 0:
            return MethodResult(
                method_name="Market Penetration Ceiling",
                applicable=False,
                note="SAM/SOM not provided; ceiling check skipped.",
            )
        ceiling = som_crore * 0.25
        avg_val = sum(valuations) / len(valuations) if valuations else 0
        exceeded = avg_val > ceiling
        return MethodResult(
            method_name="Market Penetration Ceiling",
            value_crore=round(ceiling, 2),
            weight=0.0,
            applicable=True,
            note=(
                f"Sanity ceiling: 25% of SOM (₹{som_crore} Cr) = ₹{ceiling:.2f} Cr. "
                + ("Valuation capped at ceiling." if exceeded else "Within reasonable market share bounds.")
            ),
        )

    # ─── Score Calculations ───────────────────────────────────────────────────

    def _financial_health_score(self, fin: Any, biz: Any) -> float:
        score = 0.0

        # Gross margin (max 25 pts)
        if fin.gross_margin >= 70:   score += 25
        elif fin.gross_margin >= 50: score += 18
        elif fin.gross_margin >= 30: score += 10
        elif fin.gross_margin > 0:   score += 5

        # Burn rate vs opex (max 20 pts)
        if fin.monthly_opex > 0:
            burn_efficiency = _safe_div(fin.monthly_burn, fin.monthly_opex, default=1.0)
            if burn_efficiency <= 1.1:    score += 20  # burn ≈ opex, lean
            elif burn_efficiency <= 1.5:  score += 12
            elif burn_efficiency <= 2.0:  score += 5

        # Cash runway (max 20 pts)
        if fin.monthly_burn > 0 and fin.cash_available > 0:
            runway = _safe_div(fin.cash_available, fin.monthly_burn)
            if runway >= 18:   score += 20
            elif runway >= 12: score += 14
            elif runway >= 6:  score += 7
            elif runway >= 3:  score += 2

        # Revenue (max 20 pts)
        arr_crore = _to_crore(fin.annual_revenue) if fin.annual_revenue > 0 else _to_crore(fin.mrr * 12)
        if arr_crore >= 100:  score += 20
        elif arr_crore >= 10: score += 15
        elif arr_crore >= 1:  score += 9
        elif arr_crore > 0:   score += 4

        # Funding (shows investor confidence, max 15 pts)
        funding_crore = _to_crore(fin.total_funding_raised)
        if funding_crore >= 50:  score += 15
        elif funding_crore >= 5: score += 10
        elif funding_crore >= 1: score += 5
        elif funding_crore > 0:  score += 2

        return min(score, 100.0)

    def _growth_score(self, fin: Any, biz: Any) -> float:
        score = 0.0

        # YoY revenue growth (max 40 pts)
        g = fin.revenue_growth_yoy
        if g >= 200:   score += 40
        elif g >= 100: score += 32
        elif g >= 50:  score += 22
        elif g >= 20:  score += 12
        elif g > 0:    score += 5

        # Customer growth signal via MAU (max 25 pts)
        if biz.monthly_active_users >= 100_000: score += 25
        elif biz.monthly_active_users >= 10_000: score += 18
        elif biz.monthly_active_users >= 1_000:  score += 10
        elif biz.monthly_active_users >= 100:    score += 4

        # Churn (low churn = high score, max 20 pts)
        if biz.churn_rate == 0:    score += 20   # no churn data or 0%
        elif biz.churn_rate <= 2:  score += 20
        elif biz.churn_rate <= 5:  score += 13
        elif biz.churn_rate <= 10: score += 6

        # LTV/CAC (max 15 pts)
        if biz.cac > 0 and biz.ltv > 0:
            ratio = _safe_div(biz.ltv, biz.cac)
            if ratio >= 5:   score += 15
            elif ratio >= 3: score += 10
            elif ratio >= 1: score += 4

        return min(score, 100.0)

    def _investor_readiness_score(
        self, profile: Any, fin: Any, biz: Any, market: Any,
        financial_health: float, growth_score: float
    ) -> float:
        score = 0.0

        # Financial health contribution (30%)
        score += financial_health * 0.30

        # Growth contribution (25%)
        score += growth_score * 0.25

        # Market data provided (max 20 pts)
        if market.tam > 0: score += 7
        if market.sam > 0: score += 6
        if market.som > 0: score += 7

        # Stage maturity (max 15 pts)
        stage_pts = {
            "idea": 0, "pre_seed": 3, "seed": 7,
            "series_a": 11, "series_b": 14, "series_c_plus": 15
        }
        score += stage_pts.get(profile.stage, 0)

        # Customers exist (max 10 pts)
        if biz.total_customers > 0:  score += 5
        if biz.monthly_active_users > 0: score += 5

        return min(score, 100.0)

    # ─── Qualitative Flags ────────────────────────────────────────────────────

    def _generate_flags(
        self, profile: Any, fin: Any, biz: Any, market: Any,
        fh_score: float, growth_score: float,
        runway: Optional[float], ltv_cac: Optional[float]
    ) -> Tuple[List[str], List[str]]:
        strengths: List[str] = []
        risks:     List[str] = []

        # Strengths
        if fin.revenue_growth_yoy >= 100:
            strengths.append(f"Exceptional revenue growth of {fin.revenue_growth_yoy:.0f}% YoY")
        elif fin.revenue_growth_yoy >= 50:
            strengths.append(f"Strong revenue growth of {fin.revenue_growth_yoy:.0f}% YoY")

        if fin.gross_margin >= 60:
            strengths.append(f"High gross margin of {fin.gross_margin:.0f}%")

        if ltv_cac is not None and ltv_cac >= 3:
            strengths.append(f"Healthy LTV/CAC ratio of {ltv_cac:.1f}x")

        if runway is not None and runway >= 18:
            strengths.append(f"Strong cash runway of {runway:.0f} months")

        if biz.churn_rate > 0 and biz.churn_rate <= 2:
            strengths.append(f"Low monthly churn rate of {biz.churn_rate:.1f}%")

        if market.tam >= 5000:
            strengths.append(f"Large total addressable market (₹{market.tam:,.0f} Cr)")

        if fin.total_funding_raised > 0:
            fc = _to_crore(fin.total_funding_raised)
            strengths.append(f"₹{fc:.1f} Cr in prior funding demonstrates investor confidence")

        if growth_score >= 70:
            strengths.append("Strong overall growth trajectory")

        if fh_score >= 70:
            strengths.append("Sound financial health indicators")

        # Risks
        if runway is not None and runway < 6:
            risks.append(f"Critical: only {runway:.0f} months of cash runway remaining")
        elif runway is not None and runway < 12:
            risks.append(f"Limited cash runway of {runway:.0f} months — fundraising urgency")

        if ltv_cac is not None and ltv_cac < 1:
            risks.append(f"LTV/CAC < 1 ({ltv_cac:.2f}x) — unit economics unsustainable")
        elif ltv_cac is not None and ltv_cac < 3:
            risks.append(f"LTV/CAC of {ltv_cac:.1f}x is below the healthy 3x threshold")

        if biz.churn_rate > 10:
            risks.append(f"High monthly churn of {biz.churn_rate:.1f}% threatens retention")

        if fin.gross_margin < 20 and fin.annual_revenue > 0:
            risks.append(f"Low gross margin of {fin.gross_margin:.0f}% limits profitability potential")

        if profile.stage in ("idea", "pre_seed") and biz.total_customers == 0:
            risks.append("No customers yet — execution risk remains unproven")

        if market.num_competitors > 20:
            risks.append(f"Highly competitive market ({market.num_competitors} known competitors)")

        if not strengths:
            strengths.append("Early-stage startup with growth potential")

        if not risks:
            risks.append("Execution risk inherent to all early-stage ventures")

        return strengths[:8], risks[:8]


# ─── Singleton ────────────────────────────────────────────────────────────────

_engine = ValuationEngine()


def get_valuation_engine() -> ValuationEngine:
    return _engine
