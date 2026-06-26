import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.enums import AppointmentStatus
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentProposeRequest,
    AppointmentResponse,
    AvailabilityQuery,
    AvailabilityResponse,
    AvailabilitySlot,
    HandoffResponse,
    PaginatedAppointmentsResponse,
)
from app.services.appointment_handoff_service import HandoffError, acknowledge_handoff, send_sales_handoff
from app.services.appointment_service import (
    AppointmentNotFoundError,
    BookingAnalysisError,
    InvalidAppointmentError,
    cancel_appointment,
    confirm_appointment,
    create_appointment,
    get_appointment,
    get_availability_for_conversation,
    list_appointments,
    propose_appointment,
)
from app.services.google_calendar_service import GoogleCalendarNotConnectedError
from app.services.outreach_service import OutreachConversationNotFoundError

router = APIRouter(tags=["appointments"])


@router.get(
    "/outreach-conversations/{conversation_id}/availability",
    response_model=AvailabilityResponse,
)
async def get_conversation_availability_endpoint(
    conversation_id: uuid.UUID,
    duration_minutes: int | None = Query(default=None, ge=15, le=240),
    horizon_days: int | None = Query(default=None, ge=1, le=60),
    timezone: str = Query(default="UTC"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        slots = await get_availability_for_conversation(
            db,
            current_user.organization_id,
            conversation_id,
            duration_minutes=duration_minutes,
            horizon_days=horizon_days,
            timezone=timezone,
        )
        return AvailabilityResponse(
            slots=[AvailabilitySlot(**slot) for slot in slots],
            total=len(slots),
        )
    except OutreachConversationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outreach conversation not found",
        ) from None
    except InvalidAppointmentError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    except GoogleCalendarNotConnectedError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"message": str(exc), "code": "google_calendar_not_connected"},
        ) from None


@router.post(
    "/outreach-conversations/{conversation_id}/appointments/propose",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def propose_appointment_endpoint(
    conversation_id: uuid.UUID,
    payload: AppointmentProposeRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await propose_appointment(
            db,
            current_user.organization_id,
            conversation_id,
            current_user.id,
            payload or AppointmentProposeRequest(),
        )
    except OutreachConversationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outreach conversation not found",
        ) from None
    except InvalidAppointmentError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    except BookingAnalysisError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"message": str(exc), "code": exc.code},
        ) from None


@router.post(
    "/outreach-conversations/{conversation_id}/appointments",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_appointment_endpoint(
    conversation_id: uuid.UUID,
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await create_appointment(
            db,
            current_user.organization_id,
            conversation_id,
            current_user.id,
            payload,
            confirm_immediately=payload.confirm_immediately,
        )
    except OutreachConversationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outreach conversation not found",
        ) from None
    except InvalidAppointmentError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    except GoogleCalendarNotConnectedError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"message": str(exc), "code": "google_calendar_not_connected"},
        ) from None


@router.get("/appointments", response_model=PaginatedAppointmentsResponse)
def list_appointments_endpoint(
    lead_id: uuid.UUID | None = Query(default=None),
    conversation_id: uuid.UUID | None = Query(default=None),
    status_filter: AppointmentStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = list_appointments(
        db,
        current_user.organization_id,
        lead_id=lead_id,
        conversation_id=conversation_id,
        status=status_filter,
        limit=limit,
        offset=offset,
    )
    return PaginatedAppointmentsResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/leads/{lead_id}/appointments", response_model=PaginatedAppointmentsResponse)
def list_lead_appointments_endpoint(
    lead_id: uuid.UUID,
    status_filter: AppointmentStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = list_appointments(
        db,
        current_user.organization_id,
        lead_id=lead_id,
        status=status_filter,
        limit=limit,
        offset=offset,
    )
    return PaginatedAppointmentsResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment_endpoint(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = get_appointment(db, current_user.organization_id, appointment_id)
    if appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    return appointment


@router.post("/appointments/{appointment_id}/confirm", response_model=AppointmentResponse)
async def confirm_appointment_endpoint(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await confirm_appointment(
            db,
            current_user.organization_id,
            appointment_id,
        )
    except AppointmentNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        ) from None
    except InvalidAppointmentError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None


@router.post("/appointments/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment_endpoint(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await cancel_appointment(
            db,
            current_user.organization_id,
            appointment_id,
        )
    except AppointmentNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        ) from None


@router.post("/appointments/{appointment_id}/handoff", response_model=HandoffResponse)
async def send_handoff_endpoint(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        appointment = await send_sales_handoff(
            db,
            current_user.organization_id,
            appointment_id,
        )
        return HandoffResponse(
            appointment=appointment,
            handoff_status=appointment.handoff_status,
            message="Sales handoff dispatched",
        )
    except AppointmentNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        ) from None
    except HandoffError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None


@router.post("/appointments/{appointment_id}/handoff/acknowledge", response_model=HandoffResponse)
def acknowledge_handoff_endpoint(
    appointment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        appointment = acknowledge_handoff(
            db,
            current_user.organization_id,
            appointment_id,
        )
        return HandoffResponse(
            appointment=appointment,
            handoff_status=appointment.handoff_status,
            message="Handoff acknowledged",
        )
    except AppointmentNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        ) from None
