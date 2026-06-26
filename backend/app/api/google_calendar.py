import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.enums import GoogleCalendarConnectionStatus
from app.models.user import User
from app.schemas.appointment import (
    GoogleCalendarCallbackResponse,
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
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db),
):
    try:
        connection = await handle_oauth_callback(db, code=code, state=state)
        return GoogleCalendarCallbackResponse(
            connected=True,
            google_email=connection.google_email,
            calendar_id=connection.calendar_id,
            message="Google Calendar connected successfully",
        )
    except (GoogleOAuthError, GoogleCalendarConnectionError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from None


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
