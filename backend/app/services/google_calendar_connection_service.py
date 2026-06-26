from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.enums import GoogleCalendarConnectionStatus
from app.models.google_calendar_connection import GoogleCalendarConnection
from app.services.google_oauth_service import (
    GoogleOAuthError,
    GoogleOAuthNotConfiguredError,
    build_authorization_url,
    create_oauth_state,
    encrypt_tokens_for_storage,
    exchange_code_for_tokens,
    fetch_google_email,
    revoke_token,
    verify_oauth_state,
)
from app.services.token_encryption import decrypt_token


class GoogleCalendarConnectionError(Exception):
    pass


def get_connection_status(
    db: Session,
    organization_id: uuid.UUID,
) -> GoogleCalendarConnection | None:
    return db.scalar(
        select(GoogleCalendarConnection).where(
            GoogleCalendarConnection.organization_id == organization_id,
        )
    )


def build_connect_url(
    organization_id: uuid.UUID,
    user_id: uuid.UUID,
) -> str:
    state = create_oauth_state(organization_id, user_id)
    return build_authorization_url(state=state)


async def handle_oauth_callback(
    db: Session,
    *,
    code: str,
    state: str,
) -> GoogleCalendarConnection:
    organization_id, user_id = verify_oauth_state(state)
    token_data = await exchange_code_for_tokens(code)
    email = await fetch_google_email(token_data["access_token"])
    access_enc, refresh_enc = encrypt_tokens_for_storage(
        access_token=token_data["access_token"],
        refresh_token=token_data.get("refresh_token"),
    )

    existing = db.scalar(
        select(GoogleCalendarConnection).where(
            GoogleCalendarConnection.organization_id == organization_id,
        )
    )

    if existing:
        connection = existing
    else:
        connection = GoogleCalendarConnection(organization_id=organization_id)
        db.add(connection)

    connection.connected_by_id = user_id
    connection.google_email = email
    connection.calendar_id = settings.google_calendar_id
    connection.access_token_encrypted = access_enc
    if refresh_enc:
        connection.refresh_token_encrypted = refresh_enc
    connection.token_expires_at = token_data["expires_at"]
    connection.scopes = token_data.get("scopes") or []
    connection.status = GoogleCalendarConnectionStatus.active
    db.commit()
    db.refresh(connection)
    return connection


async def disconnect_google_calendar(
    db: Session,
    organization_id: uuid.UUID,
) -> None:
    connection = get_connection_status(db, organization_id)
    if connection is None:
        return

    if connection.access_token_encrypted:
        try:
            await revoke_token(decrypt_token(connection.access_token_encrypted))
        except Exception:
            pass

    connection.status = GoogleCalendarConnectionStatus.revoked
    connection.access_token_encrypted = None
    connection.refresh_token_encrypted = None
    connection.token_expires_at = None
    db.commit()
