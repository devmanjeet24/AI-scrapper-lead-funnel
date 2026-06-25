"""Versioned prompt templates for Groq page analysis."""

PROMPT_VERSION = "page_analysis_v1"

SYSTEM_PROMPT = """You are a B2B lead intelligence analyst for an AI Scraper Lead Funnel platform.

Your job is to analyze structured page content (already extracted by a scraper) and identify
actionable business signals — leads, competitor intel, hiring signals, pricing changes, reviews,
mentions, or news.

Rules:
- Use ONLY the provided structured data. Do not invent facts not supported by the content.
- Return valid JSON matching the schema exactly.
- signal_type must be one of: lead, competitor_intel, review, mention, hiring, pricing_change, news, other
- priority must be one of: low, medium, high
- confidence_score is 0.0–1.0 (how confident you are this signal is real and actionable)
- lead_score is 0–100 (business value as a sales lead; use lower scores for weak/indirect signals)
- Return at most {max_signals} signals, ranked by lead_score descending
- If no actionable signals exist, return an empty signals array with a neutral page_summary
- recommendation should be a concrete next step for a sales/marketing team (1–2 sentences)
"""

USER_PROMPT_TEMPLATE = """Analyze this scraped page for business intelligence signals.

Job context:
- Job name: {job_name}
- Job description: {job_description}
- Source type: {source_type}
- Target URL: {target_url}
- Final URL: {final_url}

Extracted page data:
- Page title: {page_title}
- Meta description: {meta_description}
- Canonical URL: {canonical_url}
- H1 headings: {headings_h1}
- H2 headings: {headings_h2}
- Visible text sample:
{visible_text_sample}

Respond with JSON only, using this schema:
{{
  "page_summary": "string — 1-3 sentence overview of the page",
  "overall_lead_score": 0-100,
  "signals": [
    {{
      "signal_type": "lead|competitor_intel|review|mention|hiring|pricing_change|news|other",
      "title": "string — concise signal headline",
      "summary": "string — why this matters",
      "raw_snippet": "string — supporting quote or excerpt from the page",
      "confidence_score": 0.0-1.0,
      "priority": "low|medium|high",
      "lead_score": 0-100,
      "recommendation": "string — recommended next action"
    }}
  ]
}}
"""


def build_user_prompt(
    *,
    job_name: str,
    job_description: str | None,
    source_type: str,
    target_url: str,
    final_url: str | None,
    page_title: str | None,
    meta_description: str | None,
    canonical_url: str | None,
    headings_h1: list[str],
    headings_h2: list[str],
    visible_text_sample: str,
    max_signals: int,
) -> str:
    return USER_PROMPT_TEMPLATE.format(
        job_name=job_name,
        job_description=job_description or "(none)",
        source_type=source_type,
        target_url=target_url,
        final_url=final_url or target_url,
        page_title=page_title or "(none)",
        meta_description=meta_description or "(none)",
        canonical_url=canonical_url or "(none)",
        headings_h1=", ".join(headings_h1) if headings_h1 else "(none)",
        headings_h2=", ".join(headings_h2[:10]) if headings_h2 else "(none)",
        visible_text_sample=visible_text_sample or "(empty)",
        max_signals=max_signals,
    )


def build_system_prompt(*, max_signals: int) -> str:
    return SYSTEM_PROMPT.format(max_signals=max_signals)
