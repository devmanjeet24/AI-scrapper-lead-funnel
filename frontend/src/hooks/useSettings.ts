import { useQuery } from '@tanstack/react-query'

import { getApiHealth, getDatabaseHealth } from '@/api/health'
import { getSettingsStatus } from '@/api/settings'

export const settingsKeys = {
  all: ['settings'] as const,
  status: () => [...settingsKeys.all, 'status'] as const,
  health: () => [...settingsKeys.all, 'health'] as const,
  apiHealth: () => [...settingsKeys.health(), 'api'] as const,
  dbHealth: () => [...settingsKeys.health(), 'db'] as const,
}

export function useSettingsStatusQuery() {
  return useQuery({
    queryKey: settingsKeys.status(),
    queryFn: getSettingsStatus,
    staleTime: 30_000,
  })
}

export function useApiHealthQuery() {
  return useQuery({
    queryKey: settingsKeys.apiHealth(),
    queryFn: getApiHealth,
    staleTime: 15_000,
    refetchInterval: 60_000,
  })
}

export function useDatabaseHealthQuery() {
  return useQuery({
    queryKey: settingsKeys.dbHealth(),
    queryFn: getDatabaseHealth,
    staleTime: 15_000,
    refetchInterval: 60_000,
  })
}
