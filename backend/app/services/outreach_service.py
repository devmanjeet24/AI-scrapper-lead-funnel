from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ai.outreach_agent import OutreachAgent, VettingAgent
from app.core.config import settings
from app.models.deployment_package import DeploymentPackage
from app.models.enums import (
    DeploymentPackageStatus,
    LeadStatus,
    OutreachCampaignStatus,
    OutreachChannel,
    OutreachConversationStatus,
    OutreachMessageRole,
    QualificationVerdict,
)
from app.models.lead import Lead
from app.models.outreach_campaign import OutreachCampaign
from app.models.outreach_conversation import OutreachConversation
from app.models.outreach_message import OutreachMessage
from app.schemas.outreach import OutreachCampaignCreate
from app.services.deployment_package_service import get_deployment_package
from app.services.lead_service import LeadNotFoundError, get_lead
from app.services.outreach_channel_adapters import get_outreach_channel_adapter


class OutreachCampaignNotFoundError(Exception):
    pass


class OutreachConversationNotFoundError(Exception):
    pass


class InvalidOutreachError(Exception):
    pass


class OutreachAnalysisError(Exception):
    def __init__(self, message: str, code: str = "outreach_analysis_error") -> None:
        super().__init__(message)
        self.code = code


def _require_ai_enabled() -> None:
    if not settings.ai_enabled:
        raise OutreachAnalysisError("AI is disabled", code="ai_disabled")
    if not settings.groq_api_key:
        raise OutreachAnalysisError("GROQ_API_KEY is not configured", code="ai_not_configured")


def _lead_context(lead: Lead) -> dict[str, Any]:
    return {
        "title": lead.title,
        "summary": lead.summary,
        "lead_score": lead.lead_score,
        "priority": lead.priority.value if lead.priority else None,
        "recommendation": lead.recommendation,
        "source_url": lead.source_url,
    }


def _deployment_context(package: DeploymentPackage | None) -> dict[str, Any]:
    if package is None:
        return {"deployment_mode": "none"}

    payload = package.payload or {}
    lead_ctx = payload.get("lead_context", {})
    assets = payload.get("assets", {})
    headlines = assets.get("headlines", [])
    ad_copy = assets.get("ad_copy", [])

    primary_headline = headlines[0].get("body_text") if headlines else None
    ad_copy_summary = ad_copy[0].get("body_text")[:200] if ad_copy else None

    return {
        "campaign_name": payload.get("campaign_name"),
        "channel_hint": package.channel_hint or payload.get("channel_hint"),
        "deployment_mode": (package.deploy_result or {}).get("mode", "export"),
        "primary_headline": primary_headline,
        "ad_copy_summary": ad_copy_summary,
        "lead_context": lead_ctx,
    }


def _build_transcript(messages: list[OutreachMessage]) -> str:
    lines = []
    for msg in messages:
        lines.append(f"[{msg.role.value}]: {msg.content}")
    return "\n".join(lines) if lines else "(no messages)"


def _verdict_to_status(verdict: QualificationVerdict) -> OutreachConversationStatus:
    mapping = {
        QualificationVerdict.qualified: OutreachConversationStatus.qualified,
        QualificationVerdict.needs_more_info: OutreachConversationStatus.open,
        QualificationVerdict.disqualified: OutreachConversationStatus.disqualified,
        QualificationVerdict.handoff: OutreachConversationStatus.handoff,
    }
    return mapping[verdict]


async def start_outreach_campaign(
    db: Session,
    organization_id: uuid.UUID,
    user_id: uuid.UUID,
    *,
    lead_id: uuid.UUID,
    payload: OutreachCampaignCreate,
    deployment_package_id: uuid.UUID | None = None,
) -> OutreachCampaign:
    _require_ai_enabled()

    lead = get_lead(db, organization_id, lead_id)
    if lead is None:
        raise LeadNotFoundError

    package: DeploymentPackage | None = None
    if deployment_package_id is not None:
        package = get_deployment_package(db, organization_id, deployment_package_id)
        if package is None:
            raise OutreachCampaignNotFoundError
        if package.status != DeploymentPackageStatus.deployed:
            raise InvalidOutreachError(
                "Outreach can only be started from a deployed deployment package"
            )
        if package.lead_id != lead_id:
            raise InvalidOutreachError("Deployment package does not belong to this lead")

    channel = payload.channel
    if channel != OutreachChannel.internal:
        if channel == OutreachChannel.email and not payload.recipient_email:
            raise InvalidOutreachError("recipient_email is required for email outreach")
        if channel in {OutreachChannel.sms, OutreachChannel.voice} and not payload.recipient_phone:
            raise InvalidOutreachError("recipient_phone is required for sms/voice outreach")

    campaign = OutreachCampaign(
        organization_id=organization_id,
        lead_id=lead_id,
        deployment_package_id=deployment_package_id,
        created_by_id=user_id,
        status=OutreachCampaignStatus.draft,
        channel=channel,
        subject=payload.subject,
        recipient_email=payload.recipient_email,
        recipient_phone=payload.recipient_phone,
    )
    db.add(campaign)
    db.flush()

    conversation = OutreachConversation(
        organization_id=organization_id,
        campaign_id=campaign.id,
        lead_id=lead_id,
        status=OutreachConversationStatus.open,
    )
    db.add(conversation)
    db.flush()

    agent = OutreachAgent()
    draft, usage = await agent.draft_outreach(
        lead_context=_lead_context(lead),
        deployment_context=_deployment_context(package),
        channel=channel.value,
        recipient_email=payload.recipient_email,
    )

    subject = payload.subject or draft.subject
    campaign.subject = subject
    campaign.agent_metadata = {
        "outreach_draft": draft.model_dump(mode="json"),
        "llm_usage": usage.model_dump(),
        "prompt_version": OutreachAgent.prompt_version(),
        "drafted_at": datetime.now(UTC).isoformat(),
    }

    adapter = get_outreach_channel_adapter(channel)
    delivery = await adapter.send(
        subject=subject,
        content=draft.message,
        recipient_email=payload.recipient_email,
        recipient_phone=payload.recipient_phone,
    )

    db.add(
        OutreachMessage(
            organization_id=organization_id,
            conversation_id=conversation.id,
            role=OutreachMessageRole.agent,
            channel=channel,
            subject=subject,
            content=draft.message,
            delivery_metadata=delivery.metadata | {"mode": delivery.mode, "delivered": delivery.delivered},
        )
    )

    campaign.status = OutreachCampaignStatus.active
    if lead.status == LeadStatus.new:
        lead.status = LeadStatus.contacted

    db.commit()
    db.refresh(campaign)
    return campaign


async def start_outreach_from_deployment(
    db: Session,
    organization_id: uuid.UUID,
    package_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: OutreachCampaignCreate,
) -> OutreachCampaign:
    package = get_deployment_package(db, organization_id, package_id)
    if package is None:
        raise OutreachCampaignNotFoundError

    return await start_outreach_campaign(
        db,
        organization_id,
        user_id,
        lead_id=package.lead_id,
        payload=payload,
        deployment_package_id=package_id,
    )


def get_outreach_campaign(
    db: Session,
    organization_id: uuid.UUID,
    campaign_id: uuid.UUID,
) -> OutreachCampaign | None:
    return db.scalar(
        select(OutreachCampaign).where(
            OutreachCampaign.id == campaign_id,
            OutreachCampaign.organization_id == organization_id,
        )
    )


def list_outreach_campaigns(
    db: Session,
    organization_id: uuid.UUID,
    *,
    lead_id: uuid.UUID | None = None,
    status: OutreachCampaignStatus | None = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[OutreachCampaign], int]:
    filters = [OutreachCampaign.organization_id == organization_id]
    if lead_id is not None:
        filters.append(OutreachCampaign.lead_id == lead_id)
    if status is not None:
        filters.append(OutreachCampaign.status == status)

    total = db.scalar(select(func.count()).select_from(OutreachCampaign).where(*filters)) or 0
    campaigns = db.scalars(
        select(OutreachCampaign)
        .where(*filters)
        .order_by(OutreachCampaign.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(campaigns), total


def get_outreach_conversation(
    db: Session,
    organization_id: uuid.UUID,
    conversation_id: uuid.UUID,
) -> OutreachConversation | None:
    return db.scalar(
        select(OutreachConversation).where(
            OutreachConversation.id == conversation_id,
            OutreachConversation.organization_id == organization_id,
        )
    )


def list_conversations_for_campaign(
    db: Session,
    organization_id: uuid.UUID,
    campaign_id: uuid.UUID,
) -> list[OutreachConversation]:
    campaign = get_outreach_campaign(db, organization_id, campaign_id)
    if campaign is None:
        raise OutreachCampaignNotFoundError
    return list(campaign.conversations)


def list_messages_for_conversation(
    db: Session,
    organization_id: uuid.UUID,
    conversation_id: uuid.UUID,
    *,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[OutreachMessage], int]:
    conversation = get_outreach_conversation(db, organization_id, conversation_id)
    if conversation is None:
        raise OutreachConversationNotFoundError

    filters = [OutreachMessage.conversation_id == conversation_id]
    total = db.scalar(select(func.count()).select_from(OutreachMessage).where(*filters)) or 0
    messages = db.scalars(
        select(OutreachMessage)
        .where(*filters)
        .order_by(OutreachMessage.created_at.asc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(messages), total


async def add_lead_reply(
    db: Session,
    organization_id: uuid.UUID,
    conversation_id: uuid.UUID,
    *,
    content: str,
    auto_vet: bool = True,
) -> OutreachConversation:
    conversation = get_outreach_conversation(db, organization_id, conversation_id)
    if conversation is None:
        raise OutreachConversationNotFoundError

    if conversation.status not in {
        OutreachConversationStatus.open,
        OutreachConversationStatus.qualified,
    }:
        raise InvalidOutreachError(
            f"Cannot add messages to conversation with status '{conversation.status.value}'"
        )

    campaign = conversation.campaign
    db.add(
        OutreachMessage(
            organization_id=organization_id,
            conversation_id=conversation_id,
            role=OutreachMessageRole.lead,
            channel=campaign.channel,
            content=content,
            delivery_metadata={"source": "api"},
        )
    )
    db.flush()

    if auto_vet:
        conversation = await vet_conversation(db, organization_id, conversation_id)

    db.commit()
    db.refresh(conversation)
    return conversation


async def vet_conversation(
    db: Session,
    organization_id: uuid.UUID,
    conversation_id: uuid.UUID,
) -> OutreachConversation:
    _require_ai_enabled()

    conversation = get_outreach_conversation(db, organization_id, conversation_id)
    if conversation is None:
        raise OutreachConversationNotFoundError

    messages, _ = list_messages_for_conversation(
        db, organization_id, conversation_id, limit=100, offset=0
    )
    if not messages:
        raise InvalidOutreachError("Cannot vet an empty conversation")

    lead = get_lead(db, organization_id, conversation.lead_id)
    if lead is None:
        raise LeadNotFoundError

    agent = VettingAgent()
    result, usage = await agent.qualify_conversation(
        lead_context=_lead_context(lead),
        transcript=_build_transcript(messages),
    )

    conversation.qualification_score = result.qualification_score
    conversation.qualification_verdict = result.verdict
    conversation.status = _verdict_to_status(result.verdict)
    conversation.summary = result.summary
    conversation.vetting_result = {
        **result.model_dump(mode="json"),
        "llm_usage": usage.model_dump(),
        "prompt_version": VettingAgent.prompt_version(),
        "vetted_at": datetime.now(UTC).isoformat(),
    }

    if result.verdict == QualificationVerdict.needs_more_info and result.suggested_reply:
        db.add(
            OutreachMessage(
                organization_id=organization_id,
                conversation_id=conversation_id,
                role=OutreachMessageRole.agent,
                channel=conversation.campaign.channel,
                content=result.suggested_reply,
                delivery_metadata={"source": "vetting_agent_auto_reply"},
            )
        )

    campaign = conversation.campaign
    if result.verdict in {QualificationVerdict.qualified, QualificationVerdict.handoff}:
        campaign.status = OutreachCampaignStatus.completed
    elif result.verdict == QualificationVerdict.disqualified:
        campaign.status = OutreachCampaignStatus.completed

    db.commit()
    db.refresh(conversation)
    return conversation
