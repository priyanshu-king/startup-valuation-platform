"""
Health Response Schema
=======================
Pydantic model for the /api/health endpoint response.
"""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(
        ...,
        description="Service health status.",
        examples=["ok"],
    )
    service: str = Field(
        ...,
        description="Human-readable service name.",
        examples=["AI Startup Valuation Platform"],
    )
    uptime_seconds: float = Field(
        ...,
        description="Seconds elapsed since the process started.",
        examples=[42.5],
    )
    timestamp: str = Field(
        ...,
        description="ISO 8601 UTC timestamp of this response.",
        examples=["2026-01-01T00:00:00+00:00"],
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "ok",
                "service": "AI Startup Valuation Platform",
                "uptime_seconds": 42.5,
                "timestamp": "2026-01-01T00:00:00+00:00",
            }
        }
    }
