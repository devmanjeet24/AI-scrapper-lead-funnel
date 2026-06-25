import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import ScrapeSourceType, SignalStatus, SignalType
from app.models.signal import Signal


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
