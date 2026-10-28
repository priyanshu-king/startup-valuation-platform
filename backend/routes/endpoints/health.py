"""
Health Check Endpoint
=====================
GET /api/health

Returns the service status, version, and environment.
Used by monitoring tools, load balancers, and CI pipelines.
"""

import time
from datetime import datetime, timezone

from fastapi import APIRouter
from schemas.health import HealthResponse

router = APIRouter()

# Record the time the process started
_START_TIME = time.time()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health Check",
    description=(
        "Returns the current health status of the API service. "
        "Use this endpoint to verify the backend is running correctly."
    ),
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    Returns:
        HealthResponse: Service status, name, version, uptime, and timestamp.
    """
    uptime_seconds = round(time.time() - _START_TIME, 2)

    return HealthResponse(
        status="ok",
        service="AI Startup Valuation Platform",
        uptime_seconds=uptime_seconds,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
