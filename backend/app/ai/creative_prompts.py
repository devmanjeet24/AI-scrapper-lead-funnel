"""Versioned prompt templates for Groq creative generation."""

PROMPT_VERSION = "creative_generation_v1"

SYSTEM_PROMPT = """You are a B2B marketing copywriter for an AI Scraper Lead Funnel platform.

Your job is to generate ad creatives from lead intelligence — headlines, ad copy, campaign ideas,
and targeting suggestions grounded in the provided context.

Rules:
- Use ONLY the provided lead and page context. Do not invent facts not supported by the content.
- Return valid JSON matching the schema exactly.
- Headlines should be punchy and under 80 characters when possible.
- Ad copy should be professional B2B tone unless context suggests otherwise.
- channel_hint must be generic (e.g. "social", "search", "display", "email") — no platform-specific IDs.
- Return at most {max_headlines} headlines and {max_ad_copy} ad copy variants.
- Return 2–3 campaign ideas and 1–3 targeting suggestions.
"""

USER_PROMPT_TEMPLATE = """Generate marketing creatives for this lead.

Lead context:
- Title: {lead_title}
- Summary: {lead_summary}
- Recommendation: {lead_recommendation}
- Lead score: {lead_score}
- Priority: {lead_priority}
- Notes: {lead_notes}
- Source URL: {source_url}
- Source label: {source_label}
- Signal type: {signal_type}
- Source type: {source_type}

Scrape context:
- Job name: {job_name}
- Job description: {job_description}
- Page title: {page_title}
- Meta description: {meta_description}
- H1 headings: {headings_h1}
- H2 headings: {headings_h2}
- Page summary: {page_summary}
- Visible text sample:
{visible_text_sample}

Respond with JSON only, using this schema:
{{
  "campaign_name": "string — suggested campaign name",
  "campaign_objective": "string — 1-2 sentence campaign goal",
  "headlines": ["string — ad headline", ...],
  "ad_copy_variants": [
    {{
      "primary_text": "string — main ad body",
      "headline": "string — ad headline",
      "description": "string — short description line",
      "cta": "string — call to action"
    }}
  ],
  "campaign_ideas": [
    {{
      "title": "string",
      "description": "string — what to run and why",
      "channel_hint": "social|search|display|email"
    }}
  ],
  "targeting_suggestions": [
    {{
      "audience_name": "string",
      "demographics": "string — job titles, company size, geography, etc.",
      "interests": ["string", ...],
      "rationale": "string — why this audience fits"
    }}
  ]
}}
"""


def build_creative_system_prompt(*, max_headlines: int, max_ad_copy: int) -> str:
    return SYSTEM_PROMPT.format(max_headlines=max_headlines, max_ad_copy=max_ad_copy)


def build_creative_user_prompt(
    *,
    lead_title: str,
    lead_summary: str | None,
    lead_recommendation: str | None,
    lead_score: int | None,
    lead_priority: str | None,
    lead_notes: str | None,
    source_url: str | None,
    source_label: str | None,
    signal_type: str | None,
    source_type: str | None,
    job_name: str | None,
    job_description: str | None,
    page_title: str | None,
    meta_description: str | None,
    headings_h1: list[str],
    headings_h2: list[str],
    page_summary: str | None,
    visible_text_sample: str,
) -> str:
    return USER_PROMPT_TEMPLATE.format(
        lead_title=lead_title,
        lead_summary=lead_summary or "(none)",
        lead_recommendation=lead_recommendation or "(none)",
        lead_score=lead_score if lead_score is not None else "(none)",
        lead_priority=lead_priority or "(none)",
        lead_notes=lead_notes or "(none)",
        source_url=source_url or "(none)",
        source_label=source_label or "(none)",
        signal_type=signal_type or "(none)",
        source_type=source_type or "(none)",
        job_name=job_name or "(none)",
        job_description=job_description or "(none)",
        page_title=page_title or "(none)",
        meta_description=meta_description or "(none)",
        headings_h1=", ".join(headings_h1) if headings_h1 else "(none)",
        headings_h2=", ".join(headings_h2[:10]) if headings_h2 else "(none)",
        page_summary=page_summary or "(none)",
        visible_text_sample=visible_text_sample or "(empty)",
    )
