import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import ScrapeSourceType, SignalStatus, SignalType
from app.models.signal import Signal
from app.schemas.signal import SignalUpdate

_REVIEWED_STATUSES = frozenset(
    {
        SignalStatus.reviewed,
        SignalStatus.qualified,
        SignalStatus.dismissed,
    }
)


class SignalNotFoundError(Exception):
    pass


class InvalidSignalUpdateError(Exception):
    pass


def get_signal_by_id(
    db: Session,
    organization_id: uuid.UUID,
    signal_id: uuid.UUID,
) -> Signal | None:
    return db.scalar(
        select(Signal).where(
            Signal.id == signal_id,
            Signal.organization_id == organization_id,
        )
    )


def list_signals(
    db: Session,
    organization_id: uuid.UUID,
    *,
    status: SignalStatus | None = None,
    signal_type: SignalType | None = None,
    source_type: ScrapeSourceType | None = None,
    scrape_job_id: uuid.UUID | None = None,
    scrape_result_id: uuid.UUID | None = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[Signal], int]:
    filters = [Signal.organization_id == organization_id]

    if status is not None:
        filters.append(Signal.status == status)
    if signal_type is not None:
        filters.append(Signal.signal_type == signal_type)
    if source_type is not None:
        filters.append(Signal.source_type == source_type)
    if scrape_job_id is not None:
        filters.append(Signal.scrape_job_id == scrape_job_id)
    if scrape_result_id is not None:
        filters.append(Signal.scrape_result_id == scrape_result_id)

    total = db.scalar(select(func.count()).select_from(Signal).where(*filters)) or 0
    signals = db.scalars(
        select(Signal)
        .where(*filters)
        .order_by(Signal.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(signals), total


def update_signal(
    db: Session,
    organization_id: uuid.UUID,
    signal_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: SignalUpdate,
) -> Signal:
    signal = get_signal_by_id(db, organization_id, signal_id)
    if signal is None:
        raise SignalNotFoundError

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        return signal

    new_status = updates.get("status")
    if new_status is not None:
        if new_status == SignalStatus.converted:
            raise InvalidSignalUpdateError(
                "Use POST /signals/{signal_id}/convert to convert a signal to a lead"
            )

        if new_status == SignalStatus.dismissed:
            reason = updates.get("dismissed_reason", signal.dismissed_reason)
            if not reason:
                raise InvalidSignalUpdateError(
                    "dismissed_reason is required when status is dismissed"
                )
            signal.dismissed_reason = reason
        elif "dismissed_reason" not in updates:
            signal.dismissed_reason = None

        signal.status = new_status

        if new_status in _REVIEWED_STATUSES:
            signal.reviewed_by_id = user_id
            signal.reviewed_at = datetime.now(UTC)
        else:
            signal.reviewed_by_id = None
            signal.reviewed_at = None

        signal.converted_at = None

    if "priority" in updates:
        signal.priority = updates["priority"]

    if "dismissed_reason" in updates and new_status is None:
        if signal.status != SignalStatus.dismissed:
            raise InvalidSignalUpdateError(
                "dismissed_reason can only be set when status is dismissed"
            )
        signal.dismissed_reason = updates["dismissed_reason"]

    db.commit()
    db.refresh(signal)
    return signal
