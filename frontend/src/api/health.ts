import { isAxiosError } from 'axios'

import type { HealthCheckResult } from '@/types/settings'

import { apiClient } from './client'

function toDetail(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    return error.message
  }
  if (error instanceof Error) return error.message
  return fallback
}

export async function getApiHealth(): Promise<HealthCheckResult> {
  try {
    const { data } = await apiClient.get<{ status?: string }>('/health')
    const ok = data.status === 'ok'
    return {
      ok,
      label: ok ? 'Operational' : 'Degraded',
      detail: ok ? undefined : 'Unexpected health response',
    }
  } catch (error) {
    return {
      ok: false,
      label: 'Unreachable',
      detail: toDetail(error, 'Backend API is unreachable'),
    }
  }
}

export async function getDatabaseHealth(): Promise<HealthCheckResult> {
  try {
    const { data } = await apiClient.get<{ status?: string; database?: string }>('/health/db')
    const ok = data.status === 'ok' && data.database === 'connected'
    return {
      ok,
      label: ok ? 'Connected' : 'Disconnected',
      detail: ok ? undefined : 'Database is not connected',
    }
  } catch (error) {
    return {
      ok: false,
      label: 'Disconnected',
      detail: toDetail(error, 'Database is unreachable'),
    }
  }
}
