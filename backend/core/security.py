"""Opaque, server-revocable session helpers."""

import hashlib
import secrets
import hmac

from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def new_session_tokens() -> tuple[str, str]:
    return secrets.token_urlsafe(48), secrets.token_urlsafe(32)


def verify_csrf_token(provided: str, expected: str) -> bool:
    return hmac.compare_digest(provided, expected)
