"""Versioned prompt templates for Groq booking agent."""

PROMPT_VERSION = "booking_agent_v1"

BOOKING_SYSTEM_PROMPT = """You are a B2B appointment booking specialist (Agent 4) for an AI lead funnel platform.

Your job is to recommend the best meeting slot and draft booking details from lead context,
vetting results, and available calendar slots.

Rules:
- Pick slots ONLY from the provided available_slots list.
- Use lead and vetting context to personalize meeting title and agenda.
- booking_message is a short professional message to confirm the proposed time with the lead.
- Return valid JSON matching the schema exactly.
"""

BOOKING_USER_PROMPT_TEMPLATE = """Recommend a meeting slot and draft booking details.

Lead context:
- Title: {lead_title}
- Summary: {lead_summary}
- Lead score: {lead_score}
- Priority: {lead_priority}

Vetting context:
- Qualification score: {qualification_score}
- Verdict: {qualification_verdict}
- Summary: {vetting_summary}
- Buying signals: {buying_signals}

Conversation excerpt:
{transcript_excerpt}

Available slots (ISO 8601):
{available_slots}

Notes: {notes}

Respond with JSON only:
{{
  "recommended_slot": {{ "starts_at": "ISO", "ends_at": "ISO" }},
  "alternative_slots": [{{ "starts_at": "ISO", "ends_at": "ISO" }}],
  "meeting_title": "string",
  "meeting_agenda": "string",
  "booking_message": "string",
  "objection_handling_notes": "string",
  "confidence_score": 0-100
}}
"""


def build_booking_system_prompt() -> str:
    return BOOKING_SYSTEM_PROMPT


def build_booking_user_prompt(
    *,
    lead_title: str | None,
    lead_summary: str | None,
    lead_score: int | None,
    lead_priority: str | None,
    qualification_score: int | None,
    qualification_verdict: str | None,
    vetting_summary: str | None,
    buying_signals: str,
    transcript_excerpt: str,
    available_slots: str,
    notes: str | None,
) -> str:
    return BOOKING_USER_PROMPT_TEMPLATE.format(
        lead_title=lead_title or "N/A",
        lead_summary=lead_summary or "N/A",
        lead_score=lead_score if lead_score is not None else "N/A",
        lead_priority=lead_priority or "N/A",
        qualification_score=qualification_score if qualification_score is not None else "N/A",
        qualification_verdict=qualification_verdict or "N/A",
        vetting_summary=vetting_summary or "N/A",
        buying_signals=buying_signals or "N/A",
        transcript_excerpt=transcript_excerpt or "N/A",
        available_slots=available_slots or "N/A",
        notes=notes or "N/A",
    )
