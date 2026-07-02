import { useQuery } from '@tanstack/react-query'

import { fetchDashboardActivity, fetchDashboardStats } from '@/api/dashboard'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
}

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
  })
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: fetchDashboardActivity,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
