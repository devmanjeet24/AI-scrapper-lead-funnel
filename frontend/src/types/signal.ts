import type { SignalPriority } from '@/types/lead'

export type SignalStatus =
  | 'new'
  | 'reviewed'
  | 'qualified'
  | 'dismissed'
  | 'converted'
  | 'duplicate'

export type SignalType =
  | 'lead'
  | 'competitor_intel'
  | 'review'
  | 'mention'
  | 'hiring'
  | 'pricing_change'
  | 'news'
  | 'other'

export type ScrapeSourceType = 'web' | 'social' | 'competitor' | 'review' | 'other'

export interface Signal {
  id: string
  organization_id: string
  scrape_job_id: string
  scrape_result_id: string
  signal_type: SignalType
  source_type: ScrapeSourceType
  title: string
  summary: string | null
  raw_snippet: string | null
  source_url: string | null
  source_label: string | null
  extracted_data: Record<string, unknown>
  confidence_score: number | null
  status: SignalStatus
  priority: SignalPriority | null
  agent_metadata: Record<string, unknown>
  reviewed_by_id: string | null
  reviewed_at: string | null
  dismissed_reason: string | null
  converted_at: string | null
  extraction_model: string | null
  detected_at: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedSignalsResponse {
  items: Signal[]
  total: number
  limit: number
  offset: number
}

export interface SignalListParams {
  status?: SignalStatus
  signal_type?: SignalType
  source_type?: ScrapeSourceType
  scrape_job_id?: string
  scrape_result_id?: string
  limit?: number
  offset?: number
}

export interface SignalUpdateRequest {
  status?: SignalStatus
  priority?: SignalPriority | null
  dismissed_reason?: string | null
}

export type SignalSortField =
  | 'title'
  | 'lead_score'
  | 'status'
  | 'signal_type'
  | 'source_label'
  | 'priority'
  | 'detected_at'

export type SortDirection = 'asc' | 'desc'
