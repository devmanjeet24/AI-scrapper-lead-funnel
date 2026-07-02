import uuid
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.core.config import settings
from app.db.dependencies import get_db
from app.models.enums import GoogleCalendarConnectionStatus
from app.models.user import User
from app.schemas.appointment import (
    GoogleCalendarConnectResponse,
    GoogleCalendarStatusResponse,
)
from app.services.google_calendar_connection_service import (
    GoogleCalendarConnectionError,
    build_connect_url,
    disconnect_google_calendar,
    get_connection_status,
    handle_oauth_callback,
)
from app.services.google_oauth_service import GoogleOAuthError, GoogleOAuthNotConfiguredError

router = APIRouter(tags=["google-calendar"])


def _calendar_callback_redirect(*, success: bool, email: str | None = None, message: str | None = None):
    params: dict[str, str] = {"calendar": "connected" if success else "error"}
    if email:
        params["email"] = email
    if message:
        params["message"] = message
    return RedirectResponse(
        url=f"{settings.frontend_url.rstrip('/')}/appointments?{urlencode(params)}",
        status_code=status.HTTP_302_FOUND,
    )


@router.get(
    "/integrations/google-calendar/connect",
    response_model=GoogleCalendarConnectResponse,
)
def google_calendar_connect_endpoint(
    current_user: User = Depends(get_current_user),
):
    try:
        url = build_connect_url(current_user.organization_id, current_user.id)
        return GoogleCalendarConnectResponse(authorization_url=url)
    except GoogleOAuthNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from None


@router.get("/integrations/google-calendar/callback")
async def google_calendar_callback_endpoint(
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    if error:
        return _calendar_callback_redirect(success=False, message=error)

    if not code or not state:
        return _calendar_callback_redirect(
            success=False,
            message="Missing authorization code or state",
        )

    try:
        connection = await handle_oauth_callback(db, code=code, state=state)
        return _calendar_callback_redirect(success=True, email=connection.google_email)
    except (GoogleOAuthError, GoogleCalendarConnectionError) as exc:
        return _calendar_callback_redirect(success=False, message=str(exc))


@router.get(
    "/integrations/google-calendar/status",
    response_model=GoogleCalendarStatusResponse,
)
def google_calendar_status_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    connection = get_connection_status(db, current_user.organization_id)
    if connection is None or connection.status != GoogleCalendarConnectionStatus.active:
        return GoogleCalendarStatusResponse(connected=False)
    return GoogleCalendarStatusResponse(
        connected=True,
        status=connection.status,
        google_email=connection.google_email,
        calendar_id=connection.calendar_id,
        scopes=connection.scopes or [],
    )


@router.delete("/integrations/google-calendar", status_code=status.HTTP_204_NO_CONTENT)
async def google_calendar_disconnect_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await disconnect_google_calendar(db, current_user.organization_id)
