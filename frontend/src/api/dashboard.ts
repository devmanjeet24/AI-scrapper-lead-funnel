import type { DashboardStats, PaginatedTotalResponse, TimestampedItem } from '@/types/dashboard'

import { apiClient } from './client'

const RECENT_LIMIT = 100

function countSince<T extends TimestampedItem>(items: T[], hours: number): number {
  const cutoff = Date.now() - hours * 60 * 60 * 1000
  return items.filter((item) => new Date(item.created_at).getTime() >= cutoff).length
}

function countSinceDays<T extends TimestampedItem>(items: T[], days: number): number {
  return countSince(items, days * 24)
}

async function fetchTotal<T extends TimestampedItem>(
  path: string,
  params?: Record<string, string | number>,
): Promise<{ total: number; recent: T[] }> {
  const { data } = await apiClient.get<PaginatedTotalResponse<T>>(path, {
    params: { limit: RECENT_LIMIT, offset: 0, ...params },
  })
  return { total: data.total, recent: data.items }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [signals, leads, creatives, outreach, meetings, activeOutreach] = await Promise.all([
    fetchTotal<TimestampedItem>('/signals'),
    fetchTotal<TimestampedItem>('/leads'),
    fetchTotal<TimestampedItem>('/creative-assets'),
    fetchTotal<TimestampedItem>('/outreach-campaigns'),
    fetchTotal<TimestampedItem>('/appointments'),
    fetchTotal<TimestampedItem>('/outreach-campaigns', { status: 'active' }),
  ])

  return {
    signals: signals.total,
    leads: leads.total,
    creatives: creatives.total,
    outreach: outreach.total,
    meetings: meetings.total,
    signalsToday: countSince(signals.recent, 24),
    leadsToday: countSince(leads.recent, 24),
    creativesToday: countSince(creatives.recent, 24),
    meetingsThisWeek: countSinceDays(meetings.recent, 7),
    meetingsToday: countSince(meetings.recent, 24),
    activeOutreach: activeOutreach.total,
  }
}
