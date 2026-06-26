from __future__ import annotations

import uuid
from datetime import UTC, datetime, time, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.enums import GoogleCalendarConnectionStatus
from app.models.google_calendar_connection import GoogleCalendarConnection
from app.services.google_oauth_service import GoogleOAuthError, refresh_access_token
from app.services.token_encryption import TokenEncryptionError, decrypt_token, encrypt_token


class GoogleCalendarError(Exception):
    pass


class GoogleCalendarNotConnectedError(GoogleCalendarError):
    pass


def get_active_connection(
    db: Session,
    organization_id: uuid.UUID,
) -> GoogleCalendarConnection | None:
    return db.scalar(
        select(GoogleCalendarConnection).where(
            GoogleCalendarConnection.organization_id == organization_id,
            GoogleCalendarConnection.status == GoogleCalendarConnectionStatus.active,
        )
    )


def require_active_connection(
    db: Session,
    organization_id: uuid.UUID,
) -> GoogleCalendarConnection:
    connection = get_active_connection(db, organization_id)
    if connection is None:
        raise GoogleCalendarNotConnectedError(
            "Google Calendar is not connected for this organization"
        )
    return connection


async def _ensure_fresh_access_token(
    db: Session,
    connection: GoogleCalendarConnection,
) -> str:
    if not connection.refresh_token_encrypted:
        raise GoogleCalendarError("No refresh token stored — reconnect Google Calendar")

    if (
        connection.access_token_encrypted
        and connection.token_expires_at
        and connection.token_expires_at > datetime.now(UTC) + timedelta(minutes=2)
    ):
        return decrypt_token(connection.access_token_encrypted)

    refresh_token = decrypt_token(connection.refresh_token_encrypted)
    try:
        refreshed = await refresh_access_token(refresh_token)
    except GoogleOAuthError as exc:
        connection.status = GoogleCalendarConnectionStatus.expired
        db.commit()
        raise GoogleCalendarError(str(exc)) from exc

    connection.access_token_encrypted = encrypt_token(refreshed["access_token"])
    connection.token_expires_at = refreshed["expires_at"]
    db.commit()
    db.refresh(connection)
    return refreshed["access_token"]


def _build_credentials(access_token: str) -> Credentials:
    return Credentials(
        token=access_token,
        refresh_token=None,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=None,
    )


def _calendar_service(access_token: str):
    return build("calendar", "v3", credentials=_build_credentials(access_token), cache_discovery=False)


async def query_freebusy(
    db: Session,
    organization_id: uuid.UUID,
    *,
    time_min: datetime,
    time_max: datetime,
    calendar_id: str | None = None,
) -> list[dict[str, str]]:
    connection = require_active_connection(db, organization_id)
    access_token = await _ensure_fresh_access_token(db, connection)
    cal_id = calendar_id or connection.calendar_id or settings.google_calendar_id

    body = {
        "timeMin": time_min.astimezone(UTC).isoformat(),
        "timeMax": time_max.astimezone(UTC).isoformat(),
        "timeZone": "UTC",
        "items": [{"id": cal_id}],
    }

    try:
        service = _calendar_service(access_token)
        result = service.freebusy().query(body=body).execute()
        busy = result.get("calendars", {}).get(cal_id, {}).get("busy", [])
        return [{"start": b["start"], "end": b["end"]} for b in busy]
    except HttpError as exc:
        raise GoogleCalendarError(f"FreeBusy query failed: {exc}") from exc


def _parse_google_dt(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def compute_available_slots(
    *,
    time_min: datetime,
    time_max: datetime,
    busy_blocks: list[dict[str, str]],
    duration_minutes: int,
    buffer_minutes: int,
    timezone: str = "UTC",
) -> list[dict[str, Any]]:
    tz = ZoneInfo(timezone)
    duration = timedelta(minutes=duration_minutes)
    buffer = timedelta(minutes=buffer_minutes)

    busy_intervals = [
        (_parse_google_dt(b["start"]), _parse_google_dt(b["end"])) for b in busy_blocks
    ]
    busy_intervals.sort(key=lambda x: x[0])

    slots: list[dict[str, Any]] = []
    cursor = time_min.astimezone(tz)
    end_bound = time_max.astimezone(tz)

    while cursor + duration <= end_bound:
        local = cursor.astimezone(tz)
        if local.weekday() < 5 and time(9, 0) <= local.time() < time(17, 0):
            slot_start = cursor.astimezone(UTC)
            slot_end = (cursor + duration).astimezone(UTC)
            overlaps = any(
                slot_start < busy_end + buffer and slot_end + buffer > busy_start
                for busy_start, busy_end in busy_intervals
            )
            if not overlaps:
                slots.append(
                    {
                        "starts_at": slot_start,
                        "ends_at": slot_end,
                        "timezone": timezone,
                    }
                )
        cursor += timedelta(minutes=30)

    return slots


async def create_calendar_event(
    db: Session,
    organization_id: uuid.UUID,
    *,
    title: str,
    description: str | None,
    starts_at: datetime,
    ends_at: datetime,
    attendee_emails: list[str],
    timezone: str,
) -> dict[str, str]:
    connection = require_active_connection(db, organization_id)
    access_token = await _ensure_fresh_access_token(db, connection)
    cal_id = connection.calendar_id or settings.google_calendar_id

    event_body: dict[str, Any] = {
        "summary": title,
        "description": description or "",
        "start": {
            "dateTime": starts_at.astimezone(UTC).isoformat(),
            "timeZone": timezone,
        },
        "end": {
            "dateTime": ends_at.astimezone(UTC).isoformat(),
            "timeZone": timezone,
        },
        "attendees": [{"email": email} for email in attendee_emails if email],
        "reminders": {"useDefault": True},
    }

    try:
        service = _calendar_service(access_token)
        event = (
            service.events()
            .insert(calendarId=cal_id, body=event_body, sendUpdates="all")
            .execute()
        )
        return {
            "event_id": event["id"],
            "html_link": event.get("htmlLink", ""),
            "calendar_id": cal_id,
        }
    except HttpError as exc:
        raise GoogleCalendarError(f"Event creation failed: {exc}") from exc


async def delete_calendar_event(
    db: Session,
    organization_id: uuid.UUID,
    *,
    event_id: str,
    calendar_id: str | None = None,
) -> None:
    connection = require_active_connection(db, organization_id)
    access_token = await _ensure_fresh_access_token(db, connection)
    cal_id = calendar_id or connection.calendar_id or settings.google_calendar_id

    try:
        service = _calendar_service(access_token)
        service.events().delete(calendarId=cal_id, eventId=event_id, sendUpdates="all").execute()
    except HttpError as exc:
        if exc.resp.status == 404:
            return
        raise GoogleCalendarError(f"Event deletion failed: {exc}") from exc
