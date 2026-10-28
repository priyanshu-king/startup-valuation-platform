"""Authentication and CSRF dependencies for private API routes."""

from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from core.security import hash_session_token, verify_csrf_token
from core.config import settings
from models.security import AuthSession, User

SESSION_COOKIE = "valuation_session"


async def get_current_session(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthSession:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in is required.")
    session = await db.get(AuthSession, hash_session_token(token))
    if session is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session is invalid or expired.")

    expiry = session.expires_at
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
    if expiry <= datetime.now(timezone.utc):
        await db.delete(session)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session is invalid or expired.")
    return session


async def get_current_user(
    session: Annotated[AuthSession, Depends(get_current_session)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    user = await db.get(User, session.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session is invalid or expired.")
    return user


async def require_csrf(
    request: Request,
    session: Annotated[AuthSession, Depends(get_current_session)],
) -> None:
    csrf_token = request.headers.get("x-csrf-token", "")
    if not verify_csrf_token(csrf_token, session.csrf_token):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed.")


async def require_trusted_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    if origin and origin not in settings.cors_origins_list:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Request origin is not allowed.")


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentSession = Annotated[AuthSession, Depends(get_current_session)]
CsrfProtected = Annotated[None, Depends(require_csrf)]
