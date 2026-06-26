import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.enums import LeadStatus, SignalPriority
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadResponse, LeadUpdate, PaginatedLeadsResponse
from app.services.lead_service import (
    InvalidLeadUpdateError,
    LeadNotFoundError,
    archive_lead,
    create_lead,
    get_lead,
    list_leads,
    update_lead,
)

router = APIRouter(tags=["leads"])


@router.get("/leads", response_model=PaginatedLeadsResponse)
def list_leads_endpoint(
    status_filter: LeadStatus | None = Query(default=None, alias="status"),
    priority: SignalPriority | None = Query(default=None),
    scrape_job_id: uuid.UUID | None = Query(default=None),
    signal_id: uuid.UUID | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = list_leads(
        db,
        current_user.organization_id,
        status=status_filter,
        priority=priority,
        scrape_job_id=scrape_job_id,
        signal_id=signal_id,
        limit=limit,
        offset=offset,
    )
    return PaginatedLeadsResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead_endpoint(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_lead(db, current_user.organization_id, current_user.id, payload)


@router.get("/leads/{lead_id}", response_model=LeadResponse)
def get_lead_endpoint(
    lead_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = get_lead(db, current_user.organization_id, lead_id)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return lead


@router.patch("/leads/{lead_id}", response_model=LeadResponse)
def update_lead_endpoint(
    lead_id: uuid.UUID,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return update_lead(
            db,
            current_user.organization_id,
            lead_id,
            current_user.id,
            payload,
        )
    except LeadNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found") from None
    except InvalidLeadUpdateError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None


@router.delete("/leads/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead_endpoint(
    lead_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        archive_lead(db, current_user.organization_id, lead_id, current_user.id)
    except LeadNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found") from None
