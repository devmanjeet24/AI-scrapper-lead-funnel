from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.appointment import Appointment
from app.models.enums import AppointmentStatus, HandoffStatus, OutreachConversationStatus
from app.models.lead import Lead
from app.models.outreach_conversation import OutreachConversation
from app.services.appointment_service import AppointmentNotFoundError


class HandoffError(Exception):
    pass


def _build_handoff_payload(
    appointment: Appointment,
    *,
    lead: Lead,
    conversation: OutreachConversation,
) -> dict[str, Any]:
    vetting = conversation.vetting_result or {}
    deployment_context: dict[str, Any] = {}
    if conversation.campaign and conversation.campaign.deployment_package_id:
        package = conversation.campaign.deployment_package
        if package:
            deployment_context = {
                "campaign_name": package.payload.get("campaign_name"),
                "channel_hint": package.channel_hint,
            }

    return {
        "event": "appointment.booked",
        "appointment_id": str(appointment.id),
        "lead": {
            "id": str(lead.id),
            "title": lead.title,
            "summary": lead.summary,
            "lead_score": lead.lead_score,
            "source_url": lead.source_url,
        },
        "conversation": {
            "id": str(conversation.id),
            "qualification_score": conversation.qualification_score,
            "verdict": conversation.qualification_verdict.value
            if conversation.qualification_verdict
            else None,
            "summary": conversation.summary,
            "buying_signals": vetting.get("buying_signals", []),
            "red_flags": vetting.get("red_flags", []),
        },
        "appointment": {
            "starts_at": appointment.starts_at.isoformat(),
            "ends_at": appointment.ends_at.isoformat(),
            "timezone": appointment.timezone,
            "google_event_link": appointment.google_event_link,
            "attendee_email": appointment.attendee_email,
            "title": appointment.title,
        },
        "deployment_context": deployment_context,
        "handed_off_at": datetime.now(UTC).isoformat(),
    }


async def send_sales_handoff(
    db: Session,
    organization_id: uuid.UUID,
    appointment_id: uuid.UUID,
) -> Appointment:
    from app.services.appointment_service import get_appointment

    appointment = get_appointment(db, organization_id, appointment_id)
    if appointment is None:
        raise AppointmentNotFoundError

    if appointment.status != AppointmentStatus.confirmed:
        raise HandoffError("Handoff requires a confirmed appointment")

    conversation = appointment.conversation
    lead = appointment.lead
    payload = _build_handoff_payload(appointment, lead=lead, conversation=conversation)

    delivery_results: dict[str, Any] = {"webhook": None, "email": None}

    if settings.sales_handoff_webhook_url:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(settings.sales_handoff_webhook_url, json=payload)
            delivery_results["webhook"] = {
                "status_code": response.status_code,
                "ok": response.is_success,
            }

    if settings.sales_team_email and settings.resend_api_key:
        delivery_results["email"] = {
            "status": "stub",
            "message": "Resend email handoff not wired — webhook or manual follow-up",
            "to": settings.sales_team_email,
        }

    appointment.handoff_payload = {**payload, "delivery": delivery_results}
    appointment.handed_off_at = datetime.now(UTC)

    if delivery_results["webhook"] and delivery_results["webhook"].get("ok"):
        appointment.handoff_status = HandoffStatus.sent
    elif not settings.sales_handoff_webhook_url:
        appointment.handoff_status = HandoffStatus.pending
    else:
        appointment.handoff_status = HandoffStatus.pending

    db.commit()
    db.refresh(appointment)
    return appointment


def acknowledge_handoff(
    db: Session,
    organization_id: uuid.UUID,
    appointment_id: uuid.UUID,
) -> Appointment:
    from app.services.appointment_service import get_appointment

    appointment = get_appointment(db, organization_id, appointment_id)
    if appointment is None:
        raise AppointmentNotFoundError

    appointment.handoff_status = HandoffStatus.acknowledged
    db.commit()
    db.refresh(appointment)
    return appointment
