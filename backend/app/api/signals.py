import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.enums import ScrapeSourceType, SignalStatus, SignalType
from app.models.user import User
from app.schemas.signal import SignalListResponse, SignalResponse
from app.services.signal_service import get_signal_by_id, list_signals

router = APIRouter(tags=["signals"])


@router.get("/signals", response_model=SignalListResponse)
def list_signals_endpoint(
    status_filter: SignalStatus | None = Query(default=None, alias="status"),
    signal_type: SignalType | None = Query(default=None),
    source_type: ScrapeSourceType | None = Query(default=None),
    scrape_job_id: uuid.UUID | None = Query(default=None),
    scrape_result_id: uuid.UUID | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = list_signals(
        db,
        current_user.organization_id,
        status=status_filter,
        signal_type=signal_type,
        source_type=source_type,
        scrape_job_id=scrape_job_id,
        scrape_result_id=scrape_result_id,
        limit=limit,
        offset=offset,
    )
    return SignalListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/signals/{signal_id}", response_model=SignalResponse)
def get_signal_endpoint(
    signal_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    signal = get_signal_by_id(db, current_user.organization_id, signal_id)
    if signal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signal not found")
    return signal
