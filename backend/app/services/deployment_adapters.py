"""Optional ad-platform deployment adapters.

Platform integrations are optional and do not block the prototype.
When credentials are missing, adapters fall back to export mode.
"""

from __future__ import annotations

from typing import Any, Protocol

from app.ai.deployment_schemas import DeploymentPlanResult
from app.core.config import settings
from app.models.deployment_package import DeploymentPackage
from app.models.enums import DeploymentMode


class DeploymentAdapter(Protocol):
    mode: DeploymentMode

    async def deploy(
        self,
        package: DeploymentPackage,
        plan: DeploymentPlanResult | None,
    ) -> dict[str, Any]: ...


class ExportDeploymentAdapter:
    mode = DeploymentMode.export

    async def deploy(
        self,
        package: DeploymentPackage,
        plan: DeploymentPlanResult | None,
    ) -> dict[str, Any]:
        return {
            "mode": self.mode.value,
            "message": (
                "Export deployment complete. Use the package payload to manually "
                "publish creatives to your ad platform."
            ),
            "channel_hint": package.channel_hint,
            "asset_counts": {
                key: len(value)
                for key, value in package.payload.get("assets", {}).items()
            },
            "agent_plan_summary": plan.summary if plan else None,
        }


class FacebookAdsAdapter:
    mode = DeploymentMode.facebook_ads

    async def deploy(
        self,
        package: DeploymentPackage,
        plan: DeploymentPlanResult | None,
    ) -> dict[str, Any]:
        if not settings.facebook_ads_access_token:
            return await ExportDeploymentAdapter().deploy(package, plan) | {
                "fallback_reason": "FACEBOOK_ADS_ACCESS_TOKEN not configured",
                "requested_mode": self.mode.value,
            }
        return {
            "mode": self.mode.value,
            "message": "Facebook Ads deployment stub — platform API integration pending.",
            "channel_hint": package.channel_hint,
            "status": "stub",
        }


class GoogleAdsAdapter:
    mode = DeploymentMode.google_ads

    async def deploy(
        self,
        package: DeploymentPackage,
        plan: DeploymentPlanResult | None,
    ) -> dict[str, Any]:
        if not settings.google_ads_developer_token:
            return await ExportDeploymentAdapter().deploy(package, plan) | {
                "fallback_reason": "GOOGLE_ADS_DEVELOPER_TOKEN not configured",
                "requested_mode": self.mode.value,
            }
        return {
            "mode": self.mode.value,
            "message": "Google Ads deployment stub — platform API integration pending.",
            "channel_hint": package.channel_hint,
            "status": "stub",
        }


class LinkedInAdsAdapter:
    mode = DeploymentMode.linkedin_ads

    async def deploy(
        self,
        package: DeploymentPackage,
        plan: DeploymentPlanResult | None,
    ) -> dict[str, Any]:
        if not settings.linkedin_ads_access_token:
            return await ExportDeploymentAdapter().deploy(package, plan) | {
                "fallback_reason": "LINKEDIN_ADS_ACCESS_TOKEN not configured",
                "requested_mode": self.mode.value,
            }
        return {
            "mode": self.mode.value,
            "message": "LinkedIn Ads deployment stub — platform API integration pending.",
            "channel_hint": package.channel_hint,
            "status": "stub",
        }


_ADAPTERS: dict[DeploymentMode, DeploymentAdapter] = {
    DeploymentMode.export: ExportDeploymentAdapter(),
    DeploymentMode.facebook_ads: FacebookAdsAdapter(),
    DeploymentMode.google_ads: GoogleAdsAdapter(),
    DeploymentMode.linkedin_ads: LinkedInAdsAdapter(),
}


def get_deployment_adapter(mode: DeploymentMode) -> DeploymentAdapter:
    return _ADAPTERS.get(mode, ExportDeploymentAdapter())
