"""Registration and revocable cookie-session API."""

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from routes.dependencies import (
    CurrentSession,
    CurrentUser,
    SESSION_COOKIE,
    require_csrf,
    require_trusted_origin,
)
from core.config import settings
from core.rate_limit import limiter
from core.security import hash_session_token, new_session_tokens, password_hash
from database.session import get_db
from models.security import AuthSession, User
from schemas.auth import AuthResponse, CredentialsInput, UserResponse

router = APIRouter()
SESSION_MAX_AGE_SECONDS = settings.SESSION_MAX_AGE_DAYS * 24 * 60 * 60
DUMMY_PASSWORD_HASH = password_hash.hash("credential-timing-only-not-a-real-account")


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        max_age=SESSION_MAX_AGE_SECONDS,
        httponly=True,
        secure=settings.ENVIRONMENT.lower() == "production",
        samesite="strict",
        path="/api",
    )


async def _create_session(user: User, db: AsyncSession, response: Response) -> AuthResponse:
    token, csrf_token = new_session_tokens()
    session = AuthSession(
        token_hash=hash_session_token(token),
        user_id=user.id,
        csrf_token=csrf_token,
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=SESSION_MAX_AGE_SECONDS),
    )
    db.add(session)
    await db.flush()
    _set_session_cookie(response, token)
    return AuthResponse(user=UserResponse.model_validate(user), csrf_token=csrf_token)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    payload: CredentialsInput,
    response: Response,
    _: Annotated[None, Depends(require_trusted_origin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    email = str(payload.email).strip().lower()
    existing = await db.scalar(select(User.id).where(User.email == email))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")
    hashed = await run_in_threadpool(password_hash.hash, payload.password)
    user = User(email=email, password_hash=hashed)
    db.add(user)
    try:
        await db.flush()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.") from exc
    return await _create_session(user, db, response)


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    payload: CredentialsInput,
    response: Response,
    _: Annotated[None, Depends(require_trusted_origin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    email = str(payload.email).strip().lower()
    user = await db.scalar(select(User).where(User.email == email))
    stored_hash = user.password_hash if user else DUMMY_PASSWORD_HASH
    valid = await run_in_threadpool(password_hash.verify, payload.password, stored_hash)
    if user is None or not valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email or password is incorrect.")
    return await _create_session(user, db, response)


@router.get("/me", response_model=AuthResponse)
async def current_user(
    user: CurrentUser,
    session: CurrentSession,
) -> AuthResponse:
    return AuthResponse(user=UserResponse.model_validate(user), csrf_token=session.csrf_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    session: CurrentSession,
    _: Annotated[None, Depends(require_csrf)],
    __: Annotated[None, Depends(require_trusted_origin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Response:
    await db.delete(session)
    response.delete_cookie(SESSION_COOKIE, path="/api", httponly=True, samesite="strict",
                           secure=settings.ENVIRONMENT.lower() == "production")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response
