import type { ScrapeSourceType } from '@/types/signal'

export type ScrapeJobStatus = 'draft' | 'active' | 'paused' | 'archived'

export type ScrapeResultStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'

export interface ScrapeJob {
  id: string
  organization_id: string
  created_by_id: string | null
  name: string
  description: string | null
  source_type: ScrapeSourceType
  target_url: string
  config: Record<string, unknown>
  schedule_cron: string | null
  is_active: boolean
  status: ScrapeJobStatus
  last_run_at: string | null
  created_at: string
  updated_at: string
}

export interface ScrapeResult {
  id: string
  job_id: string
  triggered_by_id: string | null
  status: ScrapeResultStatus
  started_at: string | null
  finished_at: string | null
  page_title: string | null
  raw_html: string | null
  extracted_data: Record<string, unknown> | null
  items_count: number | null
  summary: string | null
  error_message: string | null
  artifact_urls: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface PaginatedScrapeJobsResponse {
  items: ScrapeJob[]
  total: number
  limit: number
  offset: number
}

export interface PaginatedScrapeResultsResponse {
  items: ScrapeResult[]
  total: number
  limit: number
  offset: number
}

export interface ScrapeRunResponse {
  result_id: string
  job_id: string
  status: ScrapeResultStatus
  message: string
}

export interface ScrapeJobCreateRequest {
  name: string
  description?: string | null
  source_type: ScrapeSourceType
  target_url: string
  schedule_cron?: string | null
}

export interface ScrapeJobListParams {
  status?: ScrapeJobStatus
  source_type?: ScrapeSourceType
  is_active?: boolean
  limit?: number
  offset?: number
}

export type ScrapeJobSortField =
  | 'name'
  | 'source_type'
  | 'status'
  | 'target_url'
  | 'last_run_at'
  | 'created_at'

export type SortDirection = 'asc' | 'desc'
