import type {
  GoogleCalendarConnectResponse,
  GoogleCalendarStatus,
} from '@/types/appointment'

import { apiClient } from './client'

export async function getGoogleCalendarStatus(): Promise<GoogleCalendarStatus> {
  const { data } = await apiClient.get<GoogleCalendarStatus>('/integrations/google-calendar/status')
  return data
}

export async function getGoogleCalendarConnectUrl(): Promise<GoogleCalendarConnectResponse> {
  const { data } = await apiClient.get<GoogleCalendarConnectResponse>(
    '/integrations/google-calendar/connect',
  )
  return data
}

export async function disconnectGoogleCalendar(): Promise<void> {
  await apiClient.delete('/integrations/google-calendar')
}
