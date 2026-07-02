from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.enums import GoogleCalendarConnectionStatus
from app.schemas.settings import (
    AIStatusResponse,
    EnvironmentStatusResponse,
    FutureIntegrationsStatusResponse,
    GoogleCalendarSettingsStatusResponse,
    SettingsStatusResponse,
)
from app.services.google_calendar_connection_service import get_connection_status


def _google_oauth_configured() -> bool:
    return bool(settings.google_client_id and settings.google_client_secret)


def _build_google_calendar_status(
    db: Session,
    organization_id: uuid.UUID,
) -> GoogleCalendarSettingsStatusResponse:
    connection = get_connection_status(db, organization_id)
    if connection is None:
        return GoogleCalendarSettingsStatusResponse(
            oauth_configured=_google_oauth_configured(),
            connected=False,
        )

    connected = connection.status == GoogleCalendarConnectionStatus.active
    return GoogleCalendarSettingsStatusResponse(
        oauth_configured=_google_oauth_configured(),
        connected=connected,
        google_email=connection.google_email,
        status=connection.status,
    )


def get_settings_status(db: Session, organization_id: uuid.UUID) -> SettingsStatusResponse:
    groq_configured = bool(settings.groq_api_key)

    return SettingsStatusResponse(
        ai=AIStatusResponse(
            enabled=settings.ai_enabled,
            configured=groq_configured,
            provider="groq",
            model=settings.groq_model,
        ),
        google_calendar=_build_google_calendar_status(db, organization_id),
        environment=EnvironmentStatusResponse(app_env=settings.app_env),
        future_integrations=FutureIntegrationsStatusResponse(
            resend_configured=bool(settings.resend_api_key),
            retell_configured=bool(settings.retell_api_key),
            vapi_configured=bool(settings.vapi_api_key),
        ),
    )
