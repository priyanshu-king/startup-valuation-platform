"""Origin validation for state-changing (CSRF-protected) requests."""

import pytest
from fastapi import HTTPException
from starlette.requests import Request

from routes.dependencies import require_trusted_origin


def make_request(origin: str, host: str = "startup-valuation-platform.vercel.app", scheme: str = "https") -> Request:
    headers = [(b"host", host.encode())]
    if origin:
        headers.append((b"origin", origin.encode()))
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/auth/login",
            "raw_path": b"/api/auth/login",
            "headers": headers,
            "scheme": scheme,
            "server": (host, 443),
            "client": ("127.0.0.1", 12345),
            "query_string": b"",
        }
    )


@pytest.mark.asyncio
async def test_same_origin_request_is_allowed():
    await require_trusted_origin(
        make_request("https://startup-valuation-platform.vercel.app")
    )


@pytest.mark.asyncio
async def test_preview_deployment_origin_is_allowed():
    """Every Vercel preview gets a fresh hostname; same-origin must pass."""
    host = "startup-valuation-platform-abc123-priyanshu-6f63.vercel.app"
    await require_trusted_origin(make_request(f"https://{host}", host=host))


@pytest.mark.asyncio
async def test_configured_origin_is_allowed():
    await require_trusted_origin(make_request("http://localhost:5173", host="127.0.0.1:8000", scheme="http"))


@pytest.mark.asyncio
async def test_request_without_origin_header_is_allowed():
    await require_trusted_origin(make_request(""))


@pytest.mark.asyncio
async def test_foreign_origin_is_rejected():
    with pytest.raises(HTTPException) as exc_info:
        await require_trusted_origin(make_request("https://evil.example.com"))
    assert exc_info.value.status_code == 403
