import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.enums import OutreachCampaignStatus
from app.models.user import User
from app.schemas.outreach import (
    LeadReplyCreate,
    OutreachCampaignCreate,
    OutreachCampaignResponse,
    OutreachConversationResponse,
    PaginatedOutreachCampaignsResponse,
    PaginatedOutreachMessagesResponse,
    VettingResponse,
)
from app.services.lead_service import LeadNotFoundError
from app.services.outreach_service import (
    InvalidOutreachError,
    OutreachAnalysisError,
    OutreachCampaignNotFoundError,
    OutreachConversationNotFoundError,
    add_lead_reply,
    get_outreach_campaign,
    get_outreach_conversation,
    list_conversations_for_campaign,
    list_messages_for_conversation,
    list_outreach_campaigns,
    start_outreach_campaign,
    start_outreach_from_deployment,
    vet_conversation,
)

router = APIRouter(tags=["outreach"])


@router.post(
    "/deployment-packages/{package_id}/outreach-campaigns",
    response_model=OutreachCampaignResponse,
    status_code=status.HTTP_201_CREATED,
)
async def start_outreach_from_deployment_endpoint(
    package_id: uuid.UUID,
    payload: OutreachCampaignCreate | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await start_outreach_from_deployment(
            db,
            current_user.organization_id,
            package_id,
            current_user.id,
            payload or OutreachCampaignCreate(),
        )
    except OutreachCampaignNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment package not found",
        ) from None
    except InvalidOutreachError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    except OutreachAnalysisError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"message": str(exc), "code": exc.code},
        ) from None


@router.post(
    "/leads/{lead_id}/outreach-campaigns",
    response_model=OutreachCampaignResponse,
    status_code=status.HTTP_201_CREATED,
)
async def start_outreach_for_lead_endpoint(
    lead_id: uuid.UUID,
    payload: OutreachCampaignCreate | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await start_outreach_campaign(
            db,
            current_user.organization_id,
            current_user.id,
            lead_id=lead_id,
            payload=payload or OutreachCampaignCreate(),
        )
    except LeadNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found") from None
    except InvalidOutreachError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    except OutreachAnalysisError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"message": str(exc), "code": exc.code},
        ) from None


@router.get("/outreach-campaigns", response_model=PaginatedOutreachCampaignsResponse)
def list_outreach_campaigns_endpoint(
    lead_id: uuid.UUID | None = Query(default=None),
    status_filter: OutreachCampaignStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = list_outreach_campaigns(
        db,
        current_user.organization_id,
        lead_id=lead_id,
        status=status_filter,
        limit=limit,
        offset=offset,
    )
    return PaginatedOutreachCampaignsResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/outreach-campaigns/{campaign_id}", response_model=OutreachCampaignResponse)
def get_outreach_campaign_endpoint(
    campaign_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = get_outreach_campaign(db, current_user.organization_id, campaign_id)
    if campaign is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outreach campaign not found",
        )
    return campaign


@router.get(
    "/outreach-campaigns/{campaign_id}/conversations",
    response_model=list[OutreachConversationResponse],
)
def list_campaign_conversations_endpoint(
    campaign_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return list_conversations_for_campaign(
            db,
            current_user.organization_id,
            campaign_id,
        )
    except OutreachCampaignNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outreach campaign not found",
        ) from None


@router.get(
    "/outreach-conversations/{conversation_id}",
    response_model=OutreachConversationResponse,
)
def get_outreach_conversation_endpoint(
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = get_outreach_conversation(db, current_user.organization_id, conversation_id)
    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outreach conversation not found",
        )
    return conversation


@router.get(
    "/outreach-conversations/{conversation_id}/messages",
    response_model=PaginatedOutreachMessagesResponse,
)
def list_conversation_messages_endpoint(
    conversation_id: uuid.UUID,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        items, total = list_messages_for_conversation(
            db,
            current_user.organization_id,
            conversation_id,
            limit=limit,
            offset=offset,
        )
        return PaginatedOutreachMessagesResponse(
            items=items,
            total=total,
            limit=limit,
            offset=offset,
        )
    except OutreachConversationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outreach conversation not found",
        ) from None


@router.post(
    "/outreach-conversations/{conversation_id}/messages",
    response_model=OutreachConversationResponse,
)
async def add_lead_reply_endpoint(
    conversation_id: uuid.UUID,
    payload: LeadReplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await add_lead_reply(
            db,
            current_user.organization_id,
            conversation_id,
            content=payload.content,
            auto_vet=payload.auto_vet,
        )
    except OutreachConversationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outreach conversation not found",
        ) from None
    except InvalidOutreachError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    except OutreachAnalysisError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"message": str(exc), "code": exc.code},
        ) from None


@router.post(
    "/outreach-conversations/{conversation_id}/vet",
    response_model=VettingResponse,
)
async def vet_conversation_endpoint(
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        conversation = await vet_conversation(
            db,
            current_user.organization_id,
            conversation_id,
        )
        vetting = conversation.vetting_result or {}
        return VettingResponse(
            conversation=conversation,
            qualification_score=conversation.qualification_score or 0,
            qualification_verdict=conversation.qualification_verdict,
            summary=conversation.summary or "",
            recommended_next_step=vetting.get("recommended_next_step", ""),
            buying_signals=vetting.get("buying_signals", []),
            red_flags=vetting.get("red_flags", []),
        )
    except OutreachConversationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Outreach conversation not found",
        ) from None
    except InvalidOutreachError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    except OutreachAnalysisError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"message": str(exc), "code": exc.code},
        ) from None
