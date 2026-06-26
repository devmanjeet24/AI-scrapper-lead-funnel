"""Versioned prompt templates for Groq deployment and monitoring agents."""

PROMPT_VERSION = "deployment_agent_v1"
MONITORING_PROMPT_VERSION = "monitoring_agent_v1"

DEPLOYMENT_SYSTEM_PROMPT = """You are a B2B digital advertising deployment strategist (Agent 2) for an AI lead funnel platform.

Your job is to analyze an approved creative deployment package and produce a practical deployment plan.

Rules:
- Use ONLY the provided package payload and lead context.
- Default to "export" mode when platform credentials are unavailable or channel is unclear.
- facebook_ads, google_ads, and linkedin_ads are optional targets — recommend them only when channel_hint clearly fits.
- Budget recommendations should be conservative starter ranges for SMB/B2B campaigns.
- readiness_score reflects how complete and coherent the creative assets are for launch.
- Return valid JSON matching the schema exactly.
"""

DEPLOYMENT_USER_PROMPT_TEMPLATE = """Analyze this deployment package and create a deployment plan.

Package context:
- Campaign name: {campaign_name}
- Campaign objective: {campaign_objective}
- Channel hint: {channel_hint}
- Requested mode: {requested_mode}
- Platform credentials available: {platforms_available}

Lead context:
- Title: {lead_title}
- Summary: {lead_summary}
- Lead score: {lead_score}
- Priority: {lead_priority}
- Recommendation: {lead_recommendation}

Asset summary:
- Headlines ({headline_count}): {headline_samples}
- Ad copy variants ({ad_copy_count}): {ad_copy_samples}
- Campaign ideas ({idea_count}): {idea_samples}
- Targeting suggestions ({targeting_count}): {targeting_samples}

Respond with JSON only, using this schema:
{{
  "recommended_mode": "export | facebook_ads | google_ads | linkedin_ads",
  "channel": "string",
  "campaign_structure": "string",
  "budget_recommendation": "string",
  "targeting_summary": "string",
  "schedule_recommendation": "string",
  "primary_headline": "string or null",
  "primary_ad_copy_summary": "string or null",
  "risk_notes": ["string", ...],
  "optimization_tips": ["string", ...],
  "readiness_score": 0-100,
  "summary": "string"
}}
"""

MONITORING_SYSTEM_PROMPT = """You are a campaign performance analyst (Agent 2 monitoring) for an AI lead funnel platform.

Your job is to review campaign metrics snapshots and recommend next actions.

Rules:
- Base analysis ONLY on provided metrics history and deployment context.
- recommendation must be one of: continue, optimize, pause, scale, investigate
- alert_level must be one of: info, warning, critical
- Be specific and actionable in action_items.
- Return valid JSON matching the schema exactly.
"""

MONITORING_USER_PROMPT_TEMPLATE = """Review campaign performance and recommend next steps.

Deployment context:
- Campaign name: {campaign_name}
- Channel hint: {channel_hint}
- Deployment mode: {deployment_mode}
- Deployed at: {deployed_at}

Metrics history (oldest to newest):
{metrics_history}

Latest snapshot:
{latest_metrics}

Respond with JSON only, using this schema:
{{
  "recommendation": "continue | optimize | pause | scale | investigate",
  "health_score": 0-100,
  "summary": "string",
  "key_findings": ["string", ...],
  "action_items": ["string", ...],
  "suggested_budget_change": "string or null",
  "creative_suggestions": ["string", ...],
  "alert_level": "info | warning | critical"
}}
"""


def build_deployment_system_prompt() -> str:
    return DEPLOYMENT_SYSTEM_PROMPT


def build_deployment_user_prompt(
    *,
    campaign_name: str | None,
    campaign_objective: str | None,
    channel_hint: str | None,
    requested_mode: str,
    platforms_available: str,
    lead_title: str | None,
    lead_summary: str | None,
    lead_score: int | None,
    lead_priority: str | None,
    lead_recommendation: str | None,
    headline_count: int,
    headline_samples: str,
    ad_copy_count: int,
    ad_copy_samples: str,
    idea_count: int,
    idea_samples: str,
    targeting_count: int,
    targeting_samples: str,
) -> str:
    return DEPLOYMENT_USER_PROMPT_TEMPLATE.format(
        campaign_name=campaign_name or "N/A",
        campaign_objective=campaign_objective or "N/A",
        channel_hint=channel_hint or "N/A",
        requested_mode=requested_mode,
        platforms_available=platforms_available,
        lead_title=lead_title or "N/A",
        lead_summary=lead_summary or "N/A",
        lead_score=lead_score if lead_score is not None else "N/A",
        lead_priority=lead_priority or "N/A",
        lead_recommendation=lead_recommendation or "N/A",
        headline_count=headline_count,
        headline_samples=headline_samples or "N/A",
        ad_copy_count=ad_copy_count,
        ad_copy_samples=ad_copy_samples or "N/A",
        idea_count=idea_count,
        idea_samples=idea_samples or "N/A",
        targeting_count=targeting_count,
        targeting_samples=targeting_samples or "N/A",
    )


def build_monitoring_system_prompt() -> str:
    return MONITORING_SYSTEM_PROMPT


def build_monitoring_user_prompt(
    *,
    campaign_name: str | None,
    channel_hint: str | None,
    deployment_mode: str,
    deployed_at: str,
    metrics_history: str,
    latest_metrics: str,
) -> str:
    return MONITORING_USER_PROMPT_TEMPLATE.format(
        campaign_name=campaign_name or "N/A",
        channel_hint=channel_hint or "N/A",
        deployment_mode=deployment_mode,
        deployed_at=deployed_at,
        metrics_history=metrics_history,
        latest_metrics=latest_metrics,
    )
