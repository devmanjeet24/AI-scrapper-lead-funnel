from pydantic import BaseModel, Field

from app.models.enums import GoogleCalendarConnectionStatus


class AIStatusResponse(BaseModel):
    enabled: bool
    configured: bool
    provider: str = Field(default="groq")
    model: str


class GoogleCalendarSettingsStatusResponse(BaseModel):
    oauth_configured: bool
    connected: bool
    google_email: str | None = None
    status: GoogleCalendarConnectionStatus | None = None


class EnvironmentStatusResponse(BaseModel):
    app_env: str


class FutureIntegrationsStatusResponse(BaseModel):
    resend_configured: bool
    retell_configured: bool
    vapi_configured: bool


class SettingsStatusResponse(BaseModel):
    ai: AIStatusResponse
    google_calendar: GoogleCalendarSettingsStatusResponse
    environment: EnvironmentStatusResponse
    future_integrations: FutureIntegrationsStatusResponse
