"""Optional outreach channel adapters.

Channels fall back to internal (in-app) delivery when external APIs are not configured.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Protocol

import httpx

from app.core.config import settings
from app.models.enums import OutreachChannel

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


@dataclass
class DeliveryResult:
    delivered: bool
    mode: str
    metadata: dict[str, Any]


class OutreachChannelAdapter(Protocol):
    channel: OutreachChannel

    async def send(
        self,
        *,
        subject: str,
        content: str,
        recipient_email: str | None,
        recipient_phone: str | None,
    ) -> DeliveryResult: ...


class InternalChannelAdapter:
    channel = OutreachChannel.internal

    async def send(
        self,
        *,
        subject: str,
        content: str,
        recipient_email: str | None,
        recipient_phone: str | None,
    ) -> DeliveryResult:
        return DeliveryResult(
            delivered=True,
            mode="internal",
            metadata={
                "message": "Message stored in conversation thread (no external delivery).",
            },
        )


class EmailChannelAdapter:
    channel = OutreachChannel.email

    async def send(
        self,
        *,
        subject: str,
        content: str,
        recipient_email: str | None,
        recipient_phone: str | None,
    ) -> DeliveryResult:
        # Graceful fallback: keep existing behaviour when the provider is not set up.
        if not settings.resend_api_key or not recipient_email:
            return DeliveryResult(
                delivered=True,
                mode="internal_fallback",
                metadata={
                    "message": (
                        "Email channel requested but RESEND_API_KEY not configured "
                        "(or no recipient email). Message stored in conversation thread."
                    ),
                    "fallback_from": self.channel.value,
                },
            )

        payload: dict[str, Any] = {
            "from": settings.resend_from_email,
            "to": [recipient_email],
            "subject": subject or "Message from our team",
            "text": content,
        }
        if settings.resend_reply_to:
            payload["reply_to"] = settings.resend_reply_to

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    RESEND_API_URL,
                    headers={"Authorization": f"Bearer {settings.resend_api_key}"},
                    json=payload,
                )
        except httpx.HTTPError as exc:
            logger.warning("Resend request failed: %s", exc)
            return DeliveryResult(
                delivered=False,
                mode="resend_error",
                metadata={
                    "message": "Failed to reach Resend API. Message stored in conversation thread.",
                    "error": str(exc),
                    "recipient": recipient_email,
                    "subject": subject,
                },
            )

        if response.is_success:
            data = response.json()
            return DeliveryResult(
                delivered=True,
                mode="resend",
                metadata={
                    "message": "Email sent via Resend.",
                    "provider": "resend",
                    "provider_message_id": data.get("id"),
                    "recipient": recipient_email,
                    "from": settings.resend_from_email,
                    "subject": subject,
                },
            )

        return DeliveryResult(
            delivered=False,
            mode="resend_error",
            metadata={
                "message": "Resend rejected the email. Message stored in conversation thread.",
                "error": response.text,
                "status_code": response.status_code,
                "recipient": recipient_email,
                "subject": subject,
            },
        )


class SmsChannelAdapter:
    channel = OutreachChannel.sms

    async def send(
        self,
        *,
        subject: str,
        content: str,
        recipient_email: str | None,
        recipient_phone: str | None,
    ) -> DeliveryResult:
        return DeliveryResult(
            delivered=True,
            mode="internal_fallback",
            metadata={
                "message": "SMS channel not yet integrated. Message stored in conversation thread.",
                "recipient_phone": recipient_phone,
            },
        )


class VoiceChannelAdapter:
    channel = OutreachChannel.voice

    async def send(
        self,
        *,
        subject: str,
        content: str,
        recipient_email: str | None,
        recipient_phone: str | None,
    ) -> DeliveryResult:
        provider = None
        if settings.retell_api_key:
            provider = "retell_stub"
        elif settings.vapi_api_key:
            provider = "vapi_stub"

        return DeliveryResult(
            delivered=bool(provider),
            mode=provider or "internal_fallback",
            metadata={
                "message": (
                    "Voice outreach requires RETELL_API_KEY or VAPI_API_KEY. "
                    "Stub only — call initiation pending integration."
                ),
                "recipient_phone": recipient_phone,
            },
        )


_ADAPTERS: dict[OutreachChannel, OutreachChannelAdapter] = {
    OutreachChannel.internal: InternalChannelAdapter(),
    OutreachChannel.email: EmailChannelAdapter(),
    OutreachChannel.sms: SmsChannelAdapter(),
    OutreachChannel.voice: VoiceChannelAdapter(),
}


def get_outreach_channel_adapter(channel: OutreachChannel) -> OutreachChannelAdapter:
    return _ADAPTERS.get(channel, InternalChannelAdapter())
