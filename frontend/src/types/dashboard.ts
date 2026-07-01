export interface PaginatedTotalResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface TimestampedItem {
  created_at: string
}

export interface DashboardStats {
  signals: number
  leads: number
  creatives: number
  outreach: number
  meetings: number
  signalsToday: number
  leadsToday: number
  creativesToday: number
  meetingsThisWeek: number
  meetingsToday: number
  activeOutreach: number
}
