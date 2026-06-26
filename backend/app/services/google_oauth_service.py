from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any
from urllib.parse import urlencode

import httpx
from google_auth_oauthlib.flow import Flow
from jose import JWTError, jwt

from app.core.config import settings
from app.services.token_encryption import encrypt_token

GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"
GOOGLE_REVOKE_URI = "https://oauth2.googleapis.com/revoke"
GOOGLE_USERINFO_URI = "https://www.googleapis.com/oauth2/v2/userinfo"

GOOGLE_CALENDAR_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.freebusy",
]


class GoogleOAuthError(Exception):
    pass


class GoogleOAuthNotConfiguredError(GoogleOAuthError):
    pass


def _require_oauth_config() -> None:
    if not settings.google_client_id or not settings.google_client_secret:
        raise GoogleOAuthNotConfiguredError(
            "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured"
        )


def _client_config() -> dict[str, Any]:
    _require_oauth_config()
    return {
        "web": {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "auth_uri": GOOGLE_AUTH_URI,
            "token_uri": GOOGLE_TOKEN_URI,
            "redirect_uris": [settings.google_redirect_uri],
        }
    }


def create_oauth_state(organization_id: uuid.UUID, user_id: uuid.UUID) -> str:
    payload = {
        "org_id": str(organization_id),
        "user_id": str(user_id),
        "exp": datetime.now(UTC) + timedelta(minutes=15),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def verify_oauth_state(state: str) -> tuple[uuid.UUID, uuid.UUID]:
    try:
        payload = jwt.decode(state, settings.secret_key, algorithms=[settings.algorithm])
        org_id = uuid.UUID(payload["org_id"])
        user_id = uuid.UUID(payload["user_id"])
        return org_id, user_id
    except (JWTError, KeyError, ValueError) as exc:
        raise GoogleOAuthError("Invalid or expired OAuth state") from exc


def build_authorization_url(*, state: str) -> str:
    _require_oauth_config()
    flow = Flow.from_client_config(
        _client_config(),
        scopes=GOOGLE_CALENDAR_SCOPES,
        redirect_uri=settings.google_redirect_uri,
    )
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )
    return auth_url


async def exchange_code_for_tokens(code: str) -> dict[str, Any]:
    _require_oauth_config()
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            GOOGLE_TOKEN_URI,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
    if response.status_code != 200:
        raise GoogleOAuthError(f"Token exchange failed: {response.text}")

    data = response.json()
    expires_in = int(data.get("expires_in", 3600))
    return {
        "access_token": data["access_token"],
        "refresh_token": data.get("refresh_token"),
        "expires_at": datetime.now(UTC) + timedelta(seconds=expires_in),
        "scopes": data.get("scope", "").split(),
    }


async def refresh_access_token(refresh_token: str) -> dict[str, Any]:
    _require_oauth_config()
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            GOOGLE_TOKEN_URI,
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
        )
    if response.status_code != 200:
        raise GoogleOAuthError(f"Token refresh failed: {response.text}")

    data = response.json()
    expires_in = int(data.get("expires_in", 3600))
    return {
        "access_token": data["access_token"],
        "expires_at": datetime.now(UTC) + timedelta(seconds=expires_in),
    }


async def fetch_google_email(access_token: str) -> str:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            GOOGLE_USERINFO_URI,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if response.status_code != 200:
        raise GoogleOAuthError("Failed to fetch Google user info")
    email = response.json().get("email")
    if not email:
        raise GoogleOAuthError("Google account email not available")
    return email


async def revoke_token(token: str) -> None:
    async with httpx.AsyncClient(timeout=30.0) as client:
        await client.post(
            GOOGLE_REVOKE_URI,
            params={"token": token},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )


def encrypt_tokens_for_storage(
    *,
    access_token: str,
    refresh_token: str | None,
) -> tuple[str, str | None]:
    return encrypt_token(access_token), encrypt_token(refresh_token) if refresh_token else None
