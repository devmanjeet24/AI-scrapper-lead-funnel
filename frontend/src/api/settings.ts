import type { SettingsStatus } from '@/types/settings'

import { apiClient } from './client'

export async function getSettingsStatus(): Promise<SettingsStatus> {
  const { data } = await apiClient.get<SettingsStatus>('/settings/status')
  return data
}
