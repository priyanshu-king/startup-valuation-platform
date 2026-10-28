"""
API Router — Root
==================
Aggregates all versioned sub-routers.
"""

from fastapi import APIRouter

from routes.endpoints import auth, health, reports, valuation

api_router = APIRouter()

# ── Core endpoints ───────────────────────────────────────────────────────────
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])

# ── Valuation ────────────────────────────────────────────────────────────────
api_router.include_router(
    valuation.router,
    prefix="/valuation",
    tags=["Valuation"],
)

# ── Future feature routers ────────────────────────────────────────────────────
# from routes.endpoints import startups, reports, ai_analysis
# api_router.include_router(startups.router,    prefix="/startups",   tags=["Startups"])
# api_router.include_router(reports.router,     prefix="/reports",    tags=["Reports"])
# api_router.include_router(ai_analysis.router, prefix="/ai",         tags=["AI Analysis"])
