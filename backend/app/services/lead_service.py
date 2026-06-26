import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import LeadStatus, SignalPriority, SignalStatus
from app.models.lead import Lead
from app.models.signal import Signal
from app.schemas.lead import LeadCreate, LeadUpdate
from app.services.signal_service import SignalNotFoundError, get_signal_by_id

_NON_CONVERTIBLE_STATUSES = frozenset(
    {
        SignalStatus.converted,
        SignalStatus.dismissed,
        SignalStatus.duplicate,
    }
)


class LeadNotFoundError(Exception):
    pass


class InvalidLeadUpdateError(Exception):
    pass


class SignalNotConvertibleError(Exception):
    pass


_TRACKED_STATUSES = frozenset(
    {
        LeadStatus.contacted,
        LeadStatus.won,
        LeadStatus.lost,
    }
)

_CLOSED_STATUSES = frozenset(
    {
        LeadStatus.won,
        LeadStatus.lost,
    }
)


def list_leads(
    db: Session,
    organization_id: uuid.UUID,
    *,
    status: LeadStatus | None = None,
    priority: SignalPriority | None = None,
    scrape_job_id: uuid.UUID | None = None,
    signal_id: uuid.UUID | None = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[Lead], int]:
    filters = [Lead.organization_id == organization_id]

    if status is not None:
        filters.append(Lead.status == status)
    if priority is not None:
        filters.append(Lead.priority == priority)
    if scrape_job_id is not None:
        filters.append(Lead.scrape_job_id == scrape_job_id)
    if signal_id is not None:
        filters.append(Lead.signal_id == signal_id)

    total = db.scalar(select(func.count()).select_from(Lead).where(*filters)) or 0
    leads = db.scalars(
        select(Lead)
        .where(*filters)
        .order_by(Lead.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(leads), total


def get_lead(db: Session, organization_id: uuid.UUID, lead_id: uuid.UUID) -> Lead | None:
    return db.scalar(
        select(Lead).where(
            Lead.id == lead_id,
            Lead.organization_id == organization_id,
        )
    )


def create_lead(
    db: Session,
    organization_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: LeadCreate,
) -> Lead:
    lead = Lead(
        organization_id=organization_id,
        created_by_id=user_id,
        title=payload.title,
        summary=payload.summary,
        source_url=payload.source_url,
        source_label=payload.source_label,
        priority=payload.priority,
        lead_score=payload.lead_score,
        recommendation=payload.recommendation,
        notes=payload.notes,
        extracted_data=payload.extracted_data,
        status=LeadStatus.new,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def update_lead(
    db: Session,
    organization_id: uuid.UUID,
    lead_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: LeadUpdate,
) -> Lead:
    lead = get_lead(db, organization_id, lead_id)
    if lead is None:
        raise LeadNotFoundError

    if lead.status == LeadStatus.archived:
        raise InvalidLeadUpdateError("Archived leads cannot be updated")

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        return lead

    new_status = updates.get("status")
    if new_status is not None:
        if new_status == LeadStatus.archived:
            raise InvalidLeadUpdateError("Use DELETE /leads/{lead_id} to archive a lead")

        if new_status == LeadStatus.lost:
            reason = updates.get("closed_reason", lead.closed_reason)
            if not reason:
                raise InvalidLeadUpdateError(
                    "closed_reason is required when status is lost"
                )
            lead.closed_reason = reason
        elif "closed_reason" not in updates:
            lead.closed_reason = None

        lead.status = new_status
        now = datetime.now(UTC)

        if new_status in _TRACKED_STATUSES:
            lead.status_updated_by_id = user_id
            lead.status_updated_at = now
        else:
            lead.status_updated_by_id = None
            lead.status_updated_at = None

        if new_status in _CLOSED_STATUSES:
            lead.closed_at = now
        else:
            lead.closed_at = None

    non_status_fields = {k: v for k, v in updates.items() if k not in {"status", "closed_reason"}}
    for field, value in non_status_fields.items():
        setattr(lead, field, value)

    if "closed_reason" in updates and new_status is None:
        if lead.status != LeadStatus.lost:
            raise InvalidLeadUpdateError(
                "closed_reason can only be set when status is lost"
            )
        lead.closed_reason = updates["closed_reason"]

    db.commit()
    db.refresh(lead)
    return lead


def archive_lead(
    db: Session,
    organization_id: uuid.UUID,
    lead_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Lead:
    lead = get_lead(db, organization_id, lead_id)
    if lead is None:
        raise LeadNotFoundError

    if lead.status == LeadStatus.archived:
        return lead

    now = datetime.now(UTC)
    lead.status = LeadStatus.archived
    lead.status_updated_by_id = user_id
    lead.status_updated_at = now
    db.commit()
    db.refresh(lead)
    return lead


def _lead_exists_for_signal(db: Session, organization_id: uuid.UUID, signal_id: uuid.UUID) -> bool:
    existing = db.scalar(
        select(Lead.id).where(
            Lead.organization_id == organization_id,
            Lead.signal_id == signal_id,
        )
    )
    return existing is not None


def _lead_from_signal(signal: Signal, user_id: uuid.UUID) -> Lead:
    extracted = signal.extracted_data or {}
    return Lead(
        organization_id=signal.organization_id,
        signal_id=signal.id,
        created_by_id=user_id,
        scrape_job_id=signal.scrape_job_id,
        scrape_result_id=signal.scrape_result_id,
        title=signal.title,
        summary=signal.summary,
        source_url=signal.source_url,
        source_label=signal.source_label,
        priority=signal.priority,
        lead_score=extracted.get("lead_score"),
        recommendation=extracted.get("recommendation"),
        extracted_data=extracted,
        confidence_score=signal.confidence_score,
        status=LeadStatus.new,
    )


def convert_signal_to_lead(
    db: Session,
    organization_id: uuid.UUID,
    signal_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Lead:
    signal = get_signal_by_id(db, organization_id, signal_id)
    if signal is None:
        raise SignalNotFoundError

    if signal.status in _NON_CONVERTIBLE_STATUSES:
        raise SignalNotConvertibleError(
            f"Signal with status '{signal.status.value}' cannot be converted to a lead"
        )

    if _lead_exists_for_signal(db, organization_id, signal.id):
        raise SignalNotConvertibleError("Signal has already been converted to a lead")

    now = datetime.now(UTC)
    lead = _lead_from_signal(signal, user_id)
    signal.status = SignalStatus.converted
    signal.converted_at = now
    signal.reviewed_by_id = user_id
    signal.reviewed_at = now

    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead
