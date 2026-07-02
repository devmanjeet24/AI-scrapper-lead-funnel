import type { GoogleCalendarConnectionStatus } from '@/types/appointment'

export interface AiStatus {
  enabled: boolean
  configured: boolean
  provider: string
  model: string
}

export interface GoogleCalendarSettingsStatus {
  oauth_configured: boolean
  connected: boolean
  google_email: string | null
  status: GoogleCalendarConnectionStatus | null
}

export interface EnvironmentStatus {
  app_env: string
}

export interface FutureIntegrationsStatus {
  resend_configured: boolean
  retell_configured: boolean
  vapi_configured: boolean
}

export interface SettingsStatus {
  ai: AiStatus
  google_calendar: GoogleCalendarSettingsStatus
  environment: EnvironmentStatus
  future_integrations: FutureIntegrationsStatus
}

export type HealthLevel = 'healthy' | 'warning' | 'error'

export interface HealthCheckResult {
  ok: boolean
  label: string
  detail?: string
}
