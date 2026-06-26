from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ai.booking_agent import BookingAgent
from app.core.config import settings
from app.models.appointment import Appointment
from app.models.enums import (
    AppointmentStatus,
    HandoffStatus,
    OutreachConversationStatus,
    QualificationVerdict,
)
from app.models.lead import Lead
from app.models.outreach_conversation import OutreachConversation
from app.schemas.appointment import AppointmentCreate, AppointmentProposeRequest
from app.services.google_calendar_service import (
    GoogleCalendarError,
    GoogleCalendarNotConnectedError,
    compute_available_slots,
    create_calendar_event,
    delete_calendar_event,
    query_freebusy,
)
from app.services.lead_service import LeadNotFoundError, get_lead
from app.services.outreach_service import (
    OutreachConversationNotFoundError,
    get_outreach_conversation,
    list_messages_for_conversation,
)


class AppointmentNotFoundError(Exception):
    pass


class InvalidAppointmentError(Exception):
    pass


class BookingAnalysisError(Exception):
    def __init__(self, message: str, code: str = "booking_analysis_error") -> None:
        super().__init__(message)
        self.code = code


_BOOKABLE_STATUSES = frozenset(
    {
        OutreachConversationStatus.qualified,
        OutreachConversationStatus.handoff,
    }
)


def _require_ai_enabled() -> None:
    if not settings.ai_enabled:
        raise BookingAnalysisError("AI is disabled", code="ai_disabled")
    if not settings.groq_api_key:
        raise BookingAnalysisError("GROQ_API_KEY is not configured", code="ai_not_configured")


def _validate_bookable_conversation(conversation: OutreachConversation) -> None:
    if conversation.status not in _BOOKABLE_STATUSES:
        raise InvalidAppointmentError(
            "Appointments require a qualified or handoff outreach conversation"
        )


def _lead_context(lead: Lead) -> dict[str, Any]:
    return {
        "title": lead.title,
        "summary": lead.summary,
        "lead_score": lead.lead_score,
        "priority": lead.priority.value if lead.priority else None,
    }


def _vetting_context(conversation: OutreachConversation) -> dict[str, Any]:
    vetting = conversation.vetting_result or {}
    return {
        "qualification_score": conversation.qualification_score,
        "qualification_verdict": conversation.qualification_verdict.value
        if conversation.qualification_verdict
        else None,
        "summary": conversation.summary,
        "buying_signals": vetting.get("buying_signals", []),
    }


def _initial_handoff_status(conversation: OutreachConversation) -> HandoffStatus:
    if conversation.status == OutreachConversationStatus.handoff:
        return HandoffStatus.pending
    if conversation.qualification_verdict == QualificationVerdict.handoff:
        return HandoffStatus.pending
    return HandoffStatus.not_required


async def get_availability_for_conversation(
    db: Session,
    organization_id: uuid.UUID,
    conversation_id: uuid.UUID,
    *,
    duration_minutes: int | None = None,
    horizon_days: int | None = None,
    timezone: str = "UTC",
) -> list[dict[str, Any]]:
    conversation = get_outreach_conversation(db, organization_id, conversation_id)
    if conversation is None:
        raise OutreachConversationNotFoundError
    _validate_bookable_conversation(conversation)

    duration = duration_minutes or settings.appointment_default_duration_minutes
    horizon = horizon_days or settings.appointment_booking_horizon_days
    time_min = datetime.now(UTC)
    time_max = time_min + timedelta(days=horizon)

    busy = await query_freebusy(db, organization_id, time_min=time_min, time_max=time_max)
    return compute_available_slots(
        time_min=time_min,
        time_max=time_max,
        busy_blocks=busy,
        duration_minutes=duration,
        buffer_minutes=settings.appointment_slot_buffer_minutes,
        timezone=timezone,
    )


async def propose_appointment(
    db: Session,
    organization_id: uuid.UUID,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: AppointmentProposeRequest,
) -> Appointment:
    _require_ai_enabled()

    conversation = get_outreach_conversation(db, organization_id, conversation_id)
    if conversation is None:
        raise OutreachConversationNotFoundError
    _validate_bookable_conversation(conversation)

    lead = get_lead(db, organization_id, conversation.lead_id)
    if lead is None:
        raise LeadNotFoundError

    duration = payload.duration_minutes or settings.appointment_default_duration_minutes
    timezone = payload.timezone or "UTC"
    slots = await get_availability_for_conversation(
        db,
        organization_id,
        conversation_id,
        duration_minutes=duration,
        timezone=timezone,
    )
    if not slots:
        raise InvalidAppointmentError("No available slots found in the booking horizon")

    messages, _ = list_messages_for_conversation(
        db, organization_id, conversation_id, limit=20, offset=0
    )
    transcript = "\n".join(f"[{m.role.value}]: {m.content}" for m in messages)

    agent = BookingAgent()
    proposal, usage = await agent.propose_booking(
        lead_context=_lead_context(lead),
        vetting_context=_vetting_context(conversation),
        available_slots=slots,
        transcript_excerpt=transcript,
        notes=payload.notes,
    )

    starts_at = datetime.fromisoformat(
        proposal.recommended_slot.starts_at.replace("Z", "+00:00")
    )
    ends_at = datetime.fromisoformat(
        proposal.recommended_slot.ends_at.replace("Z", "+00:00")
    )

    appointment = Appointment(
        organization_id=organization_id,
        lead_id=lead.id,
        conversation_id=conversation_id,
        campaign_id=conversation.campaign_id,
        created_by_id=user_id,
        status=AppointmentStatus.proposed,
        title=proposal.meeting_title,
        description=proposal.meeting_agenda,
        attendee_email=payload.attendee_email,
        attendee_name=payload.attendee_name,
        starts_at=starts_at,
        ends_at=ends_at,
        timezone=timezone,
        handoff_status=_initial_handoff_status(conversation),
        agent_metadata={
            "booking_proposal": proposal.model_dump(mode="json"),
            "llm_usage": usage.model_dump(),
            "prompt_version": BookingAgent.prompt_version(),
            "proposed_at": datetime.now(UTC).isoformat(),
        },
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


async def create_appointment(
    db: Session,
    organization_id: uuid.UUID,
    conversation_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: AppointmentCreate,
    *,
    confirm_immediately: bool = True,
) -> Appointment:
    conversation = get_outreach_conversation(db, organization_id, conversation_id)
    if conversation is None:
        raise OutreachConversationNotFoundError
    _validate_bookable_conversation(conversation)

    lead = get_lead(db, organization_id, conversation.lead_id)
    if lead is None:
        raise LeadNotFoundError

    title = payload.title or f"Sales call — {lead.title}"
    appointment = Appointment(
        organization_id=organization_id,
        lead_id=lead.id,
        conversation_id=conversation_id,
        campaign_id=conversation.campaign_id,
        created_by_id=user_id,
        status=AppointmentStatus.pending_confirmation
        if not confirm_immediately
        else AppointmentStatus.proposed,
        title=title,
        description=payload.description,
        attendee_email=str(payload.attendee_email) if payload.attendee_email else None,
        attendee_name=payload.attendee_name,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        timezone=payload.timezone,
        handoff_status=_initial_handoff_status(conversation),
    )
    db.add(appointment)
    db.flush()

    if confirm_immediately:
        return await confirm_appointment(db, organization_id, appointment.id)

    db.commit()
    db.refresh(appointment)
    return appointment


async def confirm_appointment(
    db: Session,
    organization_id: uuid.UUID,
    appointment_id: uuid.UUID,
) -> Appointment:
    appointment = get_appointment(db, organization_id, appointment_id)
    if appointment is None:
        raise AppointmentNotFoundError

    if appointment.status == AppointmentStatus.confirmed:
        return appointment

    if appointment.status not in {
        AppointmentStatus.proposed,
        AppointmentStatus.pending_confirmation,
    }:
        raise InvalidAppointmentError(
            f"Cannot confirm appointment with status '{appointment.status.value}'"
        )

    attendees = []
    if appointment.attendee_email:
        attendees.append(appointment.attendee_email)
    if settings.sales_team_email:
        attendees.append(settings.sales_team_email)

    lead = appointment.lead
    description = appointment.description or ""
    if lead.summary:
        description = f"{description}\n\nLead summary: {lead.summary}".strip()

    try:
        event = await create_calendar_event(
            db,
            organization_id,
            title=appointment.title,
            description=description,
            starts_at=appointment.starts_at,
            ends_at=appointment.ends_at,
            attendee_emails=attendees,
            timezone=appointment.timezone,
        )
        appointment.status = AppointmentStatus.confirmed
        appointment.google_event_id = event["event_id"]
        appointment.google_calendar_id = event["calendar_id"]
        appointment.google_event_link = event["html_link"]
        appointment.error_message = None
        appointment.conversation.status = OutreachConversationStatus.closed
    except (GoogleCalendarNotConnectedError, GoogleCalendarError) as exc:
        appointment.status = AppointmentStatus.failed
        appointment.error_message = str(exc)
        db.commit()
        db.refresh(appointment)
        raise InvalidAppointmentError(str(exc)) from exc

    db.commit()
    db.refresh(appointment)

    if appointment.handoff_status == HandoffStatus.pending:
        from app.services.appointment_handoff_service import send_sales_handoff

        await send_sales_handoff(db, organization_id, appointment.id)

    return appointment


async def cancel_appointment(
    db: Session,
    organization_id: uuid.UUID,
    appointment_id: uuid.UUID,
) -> Appointment:
    appointment = get_appointment(db, organization_id, appointment_id)
    if appointment is None:
        raise AppointmentNotFoundError

    if appointment.status == AppointmentStatus.cancelled:
        return appointment

    if appointment.google_event_id:
        try:
            await delete_calendar_event(
                db,
                organization_id,
                event_id=appointment.google_event_id,
                calendar_id=appointment.google_calendar_id,
            )
        except GoogleCalendarError as exc:
            appointment.error_message = str(exc)

    appointment.status = AppointmentStatus.cancelled
    db.commit()
    db.refresh(appointment)
    return appointment


def get_appointment(
    db: Session,
    organization_id: uuid.UUID,
    appointment_id: uuid.UUID,
) -> Appointment | None:
    return db.scalar(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.organization_id == organization_id,
        )
    )


def list_appointments(
    db: Session,
    organization_id: uuid.UUID,
    *,
    lead_id: uuid.UUID | None = None,
    conversation_id: uuid.UUID | None = None,
    status: AppointmentStatus | None = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[Appointment], int]:
    filters = [Appointment.organization_id == organization_id]
    if lead_id is not None:
        filters.append(Appointment.lead_id == lead_id)
    if conversation_id is not None:
        filters.append(Appointment.conversation_id == conversation_id)
    if status is not None:
        filters.append(Appointment.status == status)

    total = db.scalar(select(func.count()).select_from(Appointment).where(*filters)) or 0
    appointments = db.scalars(
        select(Appointment)
        .where(*filters)
        .order_by(Appointment.starts_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(appointments), total
