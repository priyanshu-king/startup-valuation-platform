"""Authentication, report rendering, and ownership-boundary tests."""

import itertools
import os
import sys

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, os.path.dirname(__file__))
from main import app
from database.session import get_db
from models.base import Base

from test_valuation import SEED_PAYLOAD

_ports = itertools.count(30000)
PASSWORD = "example-test-password-2026"
_engine = create_async_engine("sqlite+aiosqlite:///:memory:", connect_args={"check_same_thread": False})
_session_factory = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)


def _client_ip() -> str:
    return f"127.0.1.{next(_ports) % 200 + 2}"


async def auth_test_get_db():
    async with _session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@pytest_asyncio.fixture(autouse=True)
async def auth_setup_db():
    import models  # noqa: F401
    async with _engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield
    async with _engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)


async def register(client: AsyncClient, email: str) -> dict:
    response = await client.post("/api/auth/register", json={"email": email, "password": PASSWORD})
    assert response.status_code == 201, response.text
    data = response.json()
    client.headers["X-CSRF-Token"] = data["csrf_token"]
    return data


@pytest_asyncio.fixture
async def auth_client():
    app.dependency_overrides[get_db] = auth_test_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app, client=(_client_ip(), 30000)),
        base_url="http://test",
    ) as client:
        await register(client, f"account-{next(_ports)}@example.com")
        yield client
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_auth_register_login_logout_and_user_response_secrets(auth_client):
    registered = await register(auth_client, "New.User@example.com")
    assert registered["user"]["email"] == "new.user@example.com"
    assert "password_hash" not in registered
    assert "password" not in registered
    assert "token" not in registered
    assert "valuation_session" in auth_client.cookies

    me = await auth_client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["user"]["id"] == registered["user"]["id"]
    assert me.json()["csrf_token"] == registered["csrf_token"]

    bad_login = await auth_client.post("/api/auth/login", json={
        "email": "new.user@example.com",
        "password": "incorrect-password-2026",
    })
    assert bad_login.status_code == 401
    assert "password_hash" not in bad_login.text

    logged_in = await auth_client.post("/api/auth/login", json={
        "email": "NEW.USER@example.com",
        "password": PASSWORD,
    })
    assert logged_in.status_code == 200
    auth_client.headers["X-CSRF-Token"] = logged_in.json()["csrf_token"]
    logout = await auth_client.post("/api/auth/logout")
    assert logout.status_code == 204
    assert (await auth_client.get("/api/auth/me")).status_code == 401


@pytest.mark.asyncio
async def test_private_valuation_and_reports_require_authentication(auth_client):
    for method, path in (
        ("get", "/api/reports"),
        ("get", "/api/valuation/1"),
        ("post", "/api/valuation/calculate"),
    ):
        auth_client.cookies.clear()
        auth_client.headers.pop("X-CSRF-Token", None)
        response = await getattr(auth_client, method)(path, json=SEED_PAYLOAD) if method == "post" else await getattr(auth_client, method)(path)
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_saved_report_history_detail_pdf_and_delete(auth_client):
    await register(auth_client, "report-owner@example.com")
    calculation = await auth_client.post("/api/valuation/calculate", json=SEED_PAYLOAD)
    assert calculation.status_code == 201, calculation.text
    valuation_id = calculation.json()["valuation_id"]

    history = await auth_client.get("/api/reports")
    assert history.status_code == 200, history.text
    assert len(history.json()) == 1
    report = history.json()[0]
    assert report["valuation_id"] == valuation_id
    assert report["company_name"] == "TestCo"
    assert report["status"] == "ready"

    detail = await auth_client.get(f"/api/reports/{report['report_id']}")
    assert detail.status_code == 200, detail.text
    assert detail.json()["financials"]["annual_revenue"] == SEED_PAYLOAD["financials"]["annual_revenue"]
    assert detail.json()["profile"]["name"] == SEED_PAYLOAD["profile"]["name"]

    pdf_response = await auth_client.get(f"/api/reports/{report['report_id']}/pdf")
    assert pdf_response.status_code == 200, pdf_response.text
    assert pdf_response.headers["content-type"] == "application/pdf"
    assert "attachment" in pdf_response.headers["content-disposition"]
    assert pdf_response.content.startswith(b"%PDF-")
    assert b"%%EOF" in pdf_response.content
    assert b"/Type /Page" in pdf_response.content

    deleted = await auth_client.delete(f"/api/reports/{report['report_id']}")
    assert deleted.status_code == 204
    assert (await auth_client.get(f"/api/reports/{report['report_id']}")).status_code == 404
    assert (await auth_client.get(f"/api/valuation/{valuation_id}")).status_code == 404
    assert (await auth_client.get("/api/reports")).json() == []


@pytest.mark.asyncio
async def test_user_cannot_access_another_users_report_or_valuation(auth_client):
    await register(auth_client, "owner-a@example.com")
    created_a = await auth_client.post("/api/valuation/calculate", json=SEED_PAYLOAD)
    report_a = (await auth_client.get("/api/reports")).json()[0]["report_id"]
    valuation_a = created_a.json()["valuation_id"]

    async with AsyncClient(
        transport=ASGITransport(app=app, client=(_client_ip(), 30000)),
        base_url="http://test",
    ) as client_b:
        await register(client_b, "owner-b@example.com")
        created_b = await client_b.post("/api/valuation/calculate", json=SEED_PAYLOAD)
        report_b = (await client_b.get("/api/reports")).json()[0]["report_id"]
        valuation_b = created_b.json()["valuation_id"]
        assert report_a != report_b
        assert valuation_a != valuation_b

        assert (await auth_client.get("/api/reports")).json()[0]["report_id"] == report_a
        for path in (
            f"/api/reports/{report_a}",
            f"/api/reports/{report_a}/pdf",
            f"/api/valuation/{valuation_a}",
        ):
            assert (await client_b.get(path)).status_code == 404
        assert (await client_b.delete(f"/api/reports/{report_a}")).status_code == 404
        assert (await client_b.get("/api/reports")).json()[0]["report_id"] == report_b
        for path in (
            f"/api/reports/{report_b}",
            f"/api/reports/{report_b}/pdf",
            f"/api/valuation/{valuation_b}",
        ):
            assert (await auth_client.get(path)).status_code == 404
        assert (await auth_client.delete(f"/api/reports/{report_b}")).status_code == 404


@pytest.mark.asyncio
async def test_mutating_private_endpoints_require_csrf(auth_client):
    await register(auth_client, "csrf-owner@example.com")
    auth_client.headers.pop("X-CSRF-Token")
    response = await auth_client.post("/api/valuation/calculate", json=SEED_PAYLOAD)
    assert response.status_code == 403
