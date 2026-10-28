"""
Test: Health Check Endpoint
============================
Tests the GET /api/health endpoint.
Run with:  pytest backend/tests/test_health.py -v
"""

import pytest
from httpx import ASGITransport, AsyncClient

from main import app


@pytest.mark.asyncio
async def test_health_check_status_code():
    """Health endpoint should return HTTP 200."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/health")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_health_check_response_body():
    """Health endpoint should return correct JSON structure."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/health")

    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "AI Startup Valuation Platform"
    assert "uptime_seconds" in data
    assert "timestamp" in data
    assert isinstance(data["uptime_seconds"], float)


@pytest.mark.asyncio
async def test_health_check_content_type():
    """Health endpoint should return application/json."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/health")

    assert "application/json" in response.headers["content-type"]
