"""
Tests for POST /api/valuation/calculate  and  GET /api/valuation/{id}
"""

import pytest
import pytest_asyncio
from itertools import count
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from models.base import Base
from database.session import get_db
from main import app

# ─── In-memory test database ──────────────────────────────────────────────────

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = async_sessionmaker(
    bind=test_engine, class_=AsyncSession,
    expire_on_commit=False, autocommit=False, autoflush=False,
)
_TEST_CLIENT_PORTS = count(20000)


def _client_ip() -> str:
    return f"127.0.0.{next(_TEST_CLIENT_PORTS) % 200 + 2}"


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest_asyncio.fixture(autouse=True, scope="function")
async def setup_db():
    """Create all tables before each test, drop after."""
    from models import valuation  # noqa: ensure models are imported
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(setup_db):
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app, client=(_client_ip(), 20000)),
        base_url="http://test"
    ) as c:
        auth = await c.post("/api/auth/register", json={
            "email": "valuation-test@example.com",
            "password": "test-password-for-suite",
        })
        assert auth.status_code == 201, auth.text
        c.headers["X-CSRF-Token"] = auth.json()["csrf_token"]
        yield c
    app.dependency_overrides.clear()


# ─── Payloads ────────────────────────────────────────────────────────────────

SEED_PAYLOAD = {
    "profile": {
        "name": "TestCo",
        "industry": "SaaS",
        "country": "India",
        "founded_year": 2022,
        "business_model": "saas",
        "stage": "seed"
    },
    "financials": {
        "annual_revenue": 50000000,
        "mrr": 4200000,
        "revenue_growth_yoy": 120,
        "gross_margin": 72,
        "monthly_opex": 3000000,
        "monthly_burn": 3500000,
        "cash_available": 25000000,
        "total_funding_raised": 30000000
    },
    "business": {
        "total_customers": 150,
        "monthly_active_users": 1200,
        "cac": 50000,
        "ltv": 250000,
        "churn_rate": 2.5,
        "arpu": 28000
    },
    "market": {
        "tam": 50000,
        "sam": 5000,
        "som": 500,
        "market_growth": 35,
        "num_competitors": 12,
        "competitive_advantage": "First-mover in AI-powered HR"
    }
}

PRE_REVENUE_PAYLOAD = {
    "profile": {
        "name": "IdeaCo",
        "industry": "HealthTech",
        "country": "India",
        "founded_year": 2024,
        "business_model": "healthtech",
        "stage": "idea"
    },
    "financials": {
        "annual_revenue": 0, "mrr": 0, "revenue_growth_yoy": 0,
        "gross_margin": 0, "monthly_opex": 0, "monthly_burn": 0,
        "cash_available": 0, "total_funding_raised": 0
    },
    "business": {
        "total_customers": 0, "monthly_active_users": 0,
        "cac": 0, "ltv": 0, "churn_rate": 0, "arpu": 0
    },
    "market": {
        "tam": 20000, "sam": 2000, "som": 200,
        "market_growth": 40, "num_competitors": 5,
        "competitive_advantage": "Novel AI diagnostics"
    }
}


# ─── Happy Path ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_calculate_valuation_seed_startup(client):
    """Valid seed startup returns correct valuation structure."""
    resp = await client.post("/api/valuation/calculate", json=SEED_PAYLOAD)
    assert resp.status_code == 201, resp.text
    data = resp.json()

    assert data["valuation_base"] > 0
    assert data["valuation_low"] < data["valuation_base"] < data["valuation_high"]
    assert 0 <= data["financial_health_score"] <= 100
    assert 0 <= data["growth_score"] <= 100
    assert 0 <= data["investor_readiness_score"] <= 100
    assert len(data["strengths"]) > 0
    assert len(data["method_breakdown"]) > 0
    assert data["is_pre_revenue"] is False
    assert data["disclaimer"] != ""
    assert data["startup_id"] > 0
    assert data["valuation_id"] > 0


@pytest.mark.asyncio
async def test_calculate_valuation_pre_revenue(client):
    """Pre-revenue startup gets Berkus-method estimate, not zero."""
    resp = await client.post("/api/valuation/calculate", json=PRE_REVENUE_PAYLOAD)
    assert resp.status_code == 201, resp.text
    data = resp.json()

    assert data["is_pre_revenue"] is True
    assert data["valuation_base"] > 0
    # Revenue-based methods should be not applicable
    revenue_methods = [
        m for m in data["method_breakdown"]
        if m["method_name"] in ("Revenue Multiple", "Growth-Adjusted Valuation")
    ]
    assert all(not m["applicable"] for m in revenue_methods)


@pytest.mark.asyncio
async def test_calculate_valuation_returns_ai_analysis(client):
    """Response includes an input-grounded summary without fabricated claims."""
    resp = await client.post("/api/valuation/calculate", json=SEED_PAYLOAD)
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert "ai_analysis" in data
    assert "summary" in data["ai_analysis"]
    assert "₹" in data["ai_analysis"]["summary"]
    assert data["ai_analysis"]["provider"] == "rules"
    assert data["ai_analysis"]["opportunities"] == []


# ─── Validation Errors ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_missing_profile_name_rejected(client):
    payload = {**SEED_PAYLOAD, "profile": {**SEED_PAYLOAD["profile"], "name": ""}}
    resp = await client.post("/api/valuation/calculate", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_invalid_stage_rejected(client):
    payload = {**SEED_PAYLOAD, "profile": {**SEED_PAYLOAD["profile"], "stage": "unicorn"}}
    resp = await client.post("/api/valuation/calculate", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_invalid_business_model_rejected(client):
    payload = {**SEED_PAYLOAD, "profile": {**SEED_PAYLOAD["profile"], "business_model": "pizza"}}
    resp = await client.post("/api/valuation/calculate", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_negative_revenue_rejected(client):
    payload = {**SEED_PAYLOAD, "financials": {**SEED_PAYLOAD["financials"], "annual_revenue": -1}}
    resp = await client.post("/api/valuation/calculate", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_churn_rate_out_of_range_rejected(client):
    payload = {**SEED_PAYLOAD, "business": {**SEED_PAYLOAD["business"], "churn_rate": 150}}
    resp = await client.post("/api/valuation/calculate", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_market_sizes_must_be_ordered(client):
    payload = {**SEED_PAYLOAD, "market": {**SEED_PAYLOAD["market"], "tam": 100}}
    resp = await client.post("/api/valuation/calculate", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_market_som_cannot_exceed_sam(client):
    payload = {**SEED_PAYLOAD, "market": {**SEED_PAYLOAD["market"], "som": 6000}}
    resp = await client.post("/api/valuation/calculate", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_market_growth_out_of_range_rejected(client):
    payload = {**SEED_PAYLOAD, "market": {**SEED_PAYLOAD["market"], "market_growth": 1001}}
    resp = await client.post("/api/valuation/calculate", json=payload)
    assert resp.status_code == 422


# ─── GET endpoint ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_valuation_by_id(client):
    """After creating, we can retrieve by ID."""
    create = await client.post("/api/valuation/calculate", json=SEED_PAYLOAD)
    assert create.status_code == 201, create.text
    vid = create.json()["valuation_id"]

    get = await client.get(f"/api/valuation/{vid}")
    assert get.status_code == 200, get.text
    assert get.json()["valuation_id"] == vid
    formula = get.json()["assumptions"]["valuation_formula"]
    assert "simple average" in formula
    assert "weighted average" not in formula


@pytest.mark.asyncio
async def test_get_valuation_not_found(client):
    resp = await client.get("/api/valuation/99999")
    assert resp.status_code == 404
