"""
Valuation API Endpoint
=======================
POST /api/valuation/calculate
  — Accepts full startup data, runs valuation engine, saves to DB, returns results.

GET /api/valuation/{valuation_id}
  — Retrieve a previously computed valuation.
"""

import json
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.dependencies import CurrentUser, require_csrf
from database.session import get_db
from schemas.valuation import ValuationRequest, ValuationResponse, MethodResult
from services.valuation_service import get_valuation_engine
from services.ai_service import get_ai_service
from models.security import ValuationReport
from models.valuation import StartupProfile, ValuationResult

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/calculate",
    response_model=ValuationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Calculate startup valuation",
    description=(
        "Accepts a complete startup profile with financial, business, and market metrics. "
        "Runs the transparent valuation engine and returns a full structured result. "
        "Also saves the profile and result to the database."
    ),
)
async def calculate_valuation(
    payload: ValuationRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
    _: Annotated[None, Depends(require_csrf)],
) -> ValuationResponse:
    """
    Full valuation pipeline:
    1. Validate input (handled by Pydantic)
    2. Run valuation engine (mathematical, transparent)
    3. Generate a deterministic summary (no LLM required)
    4. Persist to database
    5. Return structured response
    """
    engine = get_valuation_engine()
    ai_svc = get_ai_service()

    # ── 1. Run valuation engine ───────────────────────────────────────────────
    try:
        result = engine.compute(payload)
    except Exception as exc:
        logger.exception("Valuation calculation failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Valuation calculation failed. Please review the input and try again.",
        ) from exc

    # ── 2. Run AI analysis ────────────────────────────────────────────────────
    try:
        startup_data_dict = {
            "name":  payload.profile.name,
            "stage": payload.profile.stage,
            "industry": payload.profile.industry,
            **payload.financials.model_dump(),
            **payload.business.model_dump(),
            **payload.market.model_dump(),
        }
        ai_analysis = await ai_svc.analyse_valuation(startup_data_dict, result)
    except Exception as exc:
        logger.warning("Optional valuation summary unavailable (%s)", type(exc).__name__)
        ai_analysis = {
            "summary": "AI analysis unavailable.",
            "strengths": [], "risks": [], "opportunities": [],
            "confidence": 0.0, "provider": "error",
        }

    result["ai_analysis"] = ai_analysis

    # ── 3. Persist startup profile ────────────────────────────────────────────
    profile_row = StartupProfile(
        owner_id=user.id,
        name=payload.profile.name,
        industry=payload.profile.industry,
        country=payload.profile.country,
        founded_year=payload.profile.founded_year,
        business_model=payload.profile.business_model,
        stage=payload.profile.stage,
        # financials
        annual_revenue=payload.financials.annual_revenue,
        mrr=payload.financials.mrr,
        revenue_growth_yoy=payload.financials.revenue_growth_yoy,
        gross_margin=payload.financials.gross_margin,
        monthly_opex=payload.financials.monthly_opex,
        monthly_burn=payload.financials.monthly_burn,
        cash_available=payload.financials.cash_available,
        total_funding_raised=payload.financials.total_funding_raised,
        # business
        total_customers=payload.business.total_customers,
        monthly_active_users=payload.business.monthly_active_users,
        cac=payload.business.cac,
        ltv=payload.business.ltv,
        churn_rate=payload.business.churn_rate,
        arpu=payload.business.arpu,
        # market
        tam=payload.market.tam,
        sam=payload.market.sam,
        som=payload.market.som,
        market_growth=payload.market.market_growth,
        num_competitors=payload.market.num_competitors,
        competitive_advantage=payload.market.competitive_advantage,
    )
    db.add(profile_row)
    await db.flush()  # get the auto-generated id

    # ── 4. Persist valuation result ───────────────────────────────────────────
    valuation_row = ValuationResult(
        startup_profile_id=profile_row.id,
        owner_id=user.id,
        valuation_low=result["valuation_low"],
        valuation_base=result["valuation_base"],
        valuation_high=result["valuation_high"],
        currency="INR_CRORE",
        financial_health_score=result["financial_health_score"],
        growth_score=result["growth_score"],
        investor_readiness_score=result["investor_readiness_score"],
        cash_runway_months=result["cash_runway_months"] or 0.0,
        ltv_cac_ratio=result["ltv_cac_ratio"] or 0.0,
        method_breakdown_json=json.dumps(result["method_breakdown"]),
        strengths_json=json.dumps(result["strengths"]),
        risks_json=json.dumps(result["risks"]),
        ai_analysis_json=json.dumps(result["ai_analysis"]),
        assumptions_json=json.dumps(result["assumptions"]),
        is_pre_revenue=result["is_pre_revenue"],
        disclaimer=result["disclaimer"],
    )
    db.add(valuation_row)
    await db.flush()
    db.add(ValuationReport(user_id=user.id, valuation_id=valuation_row.id, status="ready"))
    await db.flush()

    # ── 5. Build and return response ──────────────────────────────────────────
    return ValuationResponse(
        startup_id=profile_row.id,
        valuation_id=valuation_row.id,
        valuation_low=result["valuation_low"],
        valuation_base=result["valuation_base"],
        valuation_high=result["valuation_high"],
        currency="INR crore",
        financial_health_score=result["financial_health_score"],
        growth_score=result["growth_score"],
        investor_readiness_score=result["investor_readiness_score"],
        cash_runway_months=result["cash_runway_months"],
        ltv_cac_ratio=result["ltv_cac_ratio"],
        method_breakdown=[MethodResult(**m) for m in result["method_breakdown"]],
        strengths=result["strengths"],
        risks=result["risks"],
        ai_analysis=result["ai_analysis"],
        is_pre_revenue=result["is_pre_revenue"],
        disclaimer=result["disclaimer"],
        assumptions=result["assumptions"],
    )


@router.get(
    "/{valuation_id}",
    response_model=ValuationResponse,
    summary="Get valuation by ID",
)
async def get_valuation(
    valuation_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> ValuationResponse:
    """Retrieve a previously computed valuation result."""
    result = await db.scalar(select(ValuationResult).where(
        ValuationResult.id == valuation_id,
        ValuationResult.owner_id == user.id,
    ))
    if result is None:
        raise HTTPException(status_code=404, detail="Valuation not found.")

    profile = await db.scalar(select(StartupProfile).where(
        StartupProfile.id == result.startup_profile_id,
        StartupProfile.owner_id == user.id,
    ))
    if profile is None:
        raise HTTPException(status_code=404, detail="Valuation not found.")

    return ValuationResponse(
        startup_id=result.startup_profile_id,
        valuation_id=result.id,
        valuation_low=result.valuation_low,
        valuation_base=result.valuation_base,
        valuation_high=result.valuation_high,
        currency="INR crore",
        financial_health_score=result.financial_health_score,
        growth_score=result.growth_score,
        investor_readiness_score=result.investor_readiness_score,
        cash_runway_months=result.cash_runway_months or None,
        ltv_cac_ratio=result.ltv_cac_ratio or None,
        method_breakdown=[
            MethodResult(**m)
            for m in json.loads(result.method_breakdown_json or "[]")
        ],
        strengths=json.loads(result.strengths_json or "[]"),
        risks=json.loads(result.risks_json or "[]"),
        ai_analysis=json.loads(result.ai_analysis_json or "{}"),
        is_pre_revenue=result.is_pre_revenue,
        disclaimer=result.disclaimer,
        assumptions=json.loads(result.assumptions_json or "{}"),
    )
