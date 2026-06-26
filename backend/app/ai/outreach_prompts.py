"""Versioned prompt templates for Groq outreach and vetting agents."""

PROMPT_VERSION = "outreach_agent_v1"
VETTING_PROMPT_VERSION = "vetting_agent_v1"

OUTREACH_SYSTEM_PROMPT = """You are a B2B sales outreach specialist (Agent 3) for an AI lead funnel platform.

Your job is to draft the first personalized outreach message for a qualified lead after campaign deployment.

Rules:
- Use ONLY the provided lead, deployment, and creative context.
- Be professional, concise, and value-focused — no spammy language.
- Do not invent company facts, pricing, or product claims not supported by context.
- For internal channel (chat simulation), write as if starting a qualification conversation.
- Return valid JSON matching the schema exactly.
"""

OUTREACH_USER_PROMPT_TEMPLATE = """Draft the initial outreach message for this lead.

Lead context:
- Title: {lead_title}
- Summary: {lead_summary}
- Lead score: {lead_score}
- Priority: {lead_priority}
- Recommendation: {lead_recommendation}
- Source URL: {source_url}

Deployment context:
- Campaign name: {campaign_name}
- Channel hint: {channel_hint}
- Deployment mode: {deployment_mode}

Creative highlights:
- Primary headline: {primary_headline}
- Ad copy summary: {ad_copy_summary}

Outreach channel: {channel}
Recipient email: {recipient_email}

Respond with JSON only:
{{
  "subject": "string — email subject or conversation opener title",
  "message": "string — full outreach body",
  "tone": "string",
  "personalization_notes": ["string", ...],
  "follow_up_suggestion": "string or null"
}}
"""

VETTING_SYSTEM_PROMPT = """You are a B2B lead qualification specialist (Agent 3 vetting) for an AI lead funnel platform.

Your job is to analyze an outreach conversation and determine whether the lead is qualified for a sales appointment.

Rules:
- Base your verdict ONLY on the conversation transcript and lead context.
- verdict must be one of: qualified, needs_more_info, disqualified, handoff
- qualification_score is 0-100 (100 = highly qualified, ready for booking)
- handoff = lead needs human sales rep (complex deal, enterprise, explicit request)
- disqualified = clear mismatch, not interested, or spam
- needs_more_info = promising but requires more discovery questions
- qualified = clear fit and buying intent, ready for appointment booking (Phase 7)
- Return valid JSON matching the schema exactly.
"""

VETTING_USER_PROMPT_TEMPLATE = """Qualify this lead based on the outreach conversation.

Lead context:
- Title: {lead_title}
- Summary: {lead_summary}
- Lead score: {lead_score}
- Priority: {lead_priority}
- Recommendation: {lead_recommendation}

Conversation transcript:
{transcript}

Respond with JSON only:
{{
  "verdict": "qualified | needs_more_info | disqualified | handoff",
  "qualification_score": 0-100,
  "summary": "string",
  "buying_signals": ["string", ...],
  "red_flags": ["string", ...],
  "recommended_next_step": "string",
  "suggested_reply": "string or null — next agent message if needs_more_info",
  "handoff_reason": "string or null — required if verdict is handoff"
}}
"""


def build_outreach_system_prompt() -> str:
    return OUTREACH_SYSTEM_PROMPT


def build_outreach_user_prompt(
    *,
    lead_title: str | None,
    lead_summary: str | None,
    lead_score: int | None,
    lead_priority: str | None,
    lead_recommendation: str | None,
    source_url: str | None,
    campaign_name: str | None,
    channel_hint: str | None,
    deployment_mode: str,
    primary_headline: str | None,
    ad_copy_summary: str | None,
    channel: str,
    recipient_email: str | None,
) -> str:
    return OUTREACH_USER_PROMPT_TEMPLATE.format(
        lead_title=lead_title or "N/A",
        lead_summary=lead_summary or "N/A",
        lead_score=lead_score if lead_score is not None else "N/A",
        lead_priority=lead_priority or "N/A",
        lead_recommendation=lead_recommendation or "N/A",
        source_url=source_url or "N/A",
        campaign_name=campaign_name or "N/A",
        channel_hint=channel_hint or "N/A",
        deployment_mode=deployment_mode,
        primary_headline=primary_headline or "N/A",
        ad_copy_summary=ad_copy_summary or "N/A",
        channel=channel,
        recipient_email=recipient_email or "N/A",
    )


def build_vetting_system_prompt() -> str:
    return VETTING_SYSTEM_PROMPT


def build_vetting_user_prompt(
    *,
    lead_title: str | None,
    lead_summary: str | None,
    lead_score: int | None,
    lead_priority: str | None,
    lead_recommendation: str | None,
    transcript: str,
) -> str:
    return VETTING_USER_PROMPT_TEMPLATE.format(
        lead_title=lead_title or "N/A",
        lead_summary=lead_summary or "N/A",
        lead_score=lead_score if lead_score is not None else "N/A",
        lead_priority=lead_priority or "N/A",
        lead_recommendation=lead_recommendation or "N/A",
        transcript=transcript,
    )
