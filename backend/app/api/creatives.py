import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.enums import CreativeAssetStatus
from app.models.user import User
from app.schemas.creative import (
    CreativeAssetResponse,
    CreativeAssetUpdate,
    CreativeGenerateRequest,
    CreativeSetResponse,
    PaginatedCreativeAssetsResponse,
    PaginatedCreativeSetsResponse,
)
from app.services.creative_service import (
    CreativeAssetNotFoundError,
    CreativeGenerationError,
    CreativeSetNotFoundError,
    InvalidCreativeUpdateError,
    generate_creatives_for_lead,
    get_creative_asset,
    get_creative_set,
    list_creative_assets,
    list_creative_sets_for_lead,
    update_creative_asset,
)
from app.services.lead_service import LeadNotFoundError

router = APIRouter(tags=["creatives"])


@router.post(
    "/leads/{lead_id}/creative-sets",
    response_model=CreativeSetResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_creatives_endpoint(
    lead_id: uuid.UUID,
    payload: CreativeGenerateRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        creative_set = await generate_creatives_for_lead(
            db,
            current_user.organization_id,
            lead_id,
            current_user.id,
            payload or CreativeGenerateRequest(),
        )
        return get_creative_set(db, current_user.organization_id, creative_set.id)
    except LeadNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found") from None
    except InvalidCreativeUpdateError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    except CreativeGenerationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"message": str(exc), "code": exc.code},
        ) from None


@router.get("/leads/{lead_id}/creative-sets", response_model=PaginatedCreativeSetsResponse)
def list_creative_sets_endpoint(
    lead_id: uuid.UUID,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = list_creative_sets_for_lead(
        db,
        current_user.organization_id,
        lead_id,
        limit=limit,
        offset=offset,
    )
    return PaginatedCreativeSetsResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/creative-sets/{creative_set_id}", response_model=CreativeSetResponse)
def get_creative_set_endpoint(
    creative_set_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    creative_set = get_creative_set(db, current_user.organization_id, creative_set_id)
    if creative_set is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creative set not found")
    return creative_set


@router.get("/creative-assets", response_model=PaginatedCreativeAssetsResponse)
def list_creative_assets_endpoint(
    creative_set_id: uuid.UUID | None = Query(default=None),
    lead_id: uuid.UUID | None = Query(default=None),
    status_filter: CreativeAssetStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = list_creative_assets(
        db,
        current_user.organization_id,
        creative_set_id=creative_set_id,
        lead_id=lead_id,
        status=status_filter,
        limit=limit,
        offset=offset,
    )
    return PaginatedCreativeAssetsResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/creative-assets/{asset_id}", response_model=CreativeAssetResponse)
def get_creative_asset_endpoint(
    asset_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = get_creative_asset(db, current_user.organization_id, asset_id)
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creative asset not found")
    return asset


@router.patch("/creative-assets/{asset_id}", response_model=CreativeAssetResponse)
def update_creative_asset_endpoint(
    asset_id: uuid.UUID,
    payload: CreativeAssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return update_creative_asset(
            db,
            current_user.organization_id,
            asset_id,
            current_user.id,
            status=payload.status,
            rejection_reason=payload.rejection_reason,
        )
    except CreativeAssetNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creative asset not found") from None
    except InvalidCreativeUpdateError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
