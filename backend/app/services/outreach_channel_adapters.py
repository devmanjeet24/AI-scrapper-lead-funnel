"""Optional outreach channel adapters.

Channels fall back to internal (in-app) delivery when external APIs are not configured.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from app.core.config import settings
from app.models.enums import OutreachChannel


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
        if settings.resend_api_key and recipient_email:
            return DeliveryResult(
                delivered=False,
                mode="resend_stub",
                metadata={
                    "message": "Resend integration stub — wire RESEND_API_KEY to enable sending.",
                    "recipient": recipient_email,
                    "subject": subject,
                },
            )
        return DeliveryResult(
            delivered=True,
            mode="internal_fallback",
            metadata={
                "message": (
                    "Email channel requested but RESEND_API_KEY not configured. "
                    "Message stored in conversation thread."
                ),
                "fallback_from": self.channel.value,
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
