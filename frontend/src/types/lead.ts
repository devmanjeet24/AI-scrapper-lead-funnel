export type LeadStatus = 'new' | 'contacted' | 'won' | 'lost' | 'archived'

export type SignalPriority = 'low' | 'medium' | 'high'

export interface Lead {
  id: string
  organization_id: string
  signal_id: string | null
  created_by_id: string | null
  scrape_job_id: string | null
  scrape_result_id: string | null
  title: string
  summary: string | null
  source_url: string | null
  source_label: string | null
  priority: SignalPriority | null
  lead_score: number | null
  recommendation: string | null
  notes: string | null
  extracted_data: Record<string, unknown>
  confidence_score: number | null
  status: LeadStatus
  status_updated_by_id: string | null
  status_updated_at: string | null
  closed_reason: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedLeadsResponse {
  items: Lead[]
  total: number
  limit: number
  offset: number
}

export interface LeadListParams {
  status?: LeadStatus
  priority?: SignalPriority
  scrape_job_id?: string
  signal_id?: string
  limit?: number
  offset?: number
}

export interface LeadCreateRequest {
  title: string
  summary?: string | null
  source_url?: string | null
  source_label?: string | null
  priority?: SignalPriority | null
  lead_score?: number | null
  recommendation?: string | null
  notes?: string | null
  extracted_data?: Record<string, unknown>
}

export interface LeadUpdateRequest {
  title?: string
  summary?: string | null
  source_url?: string | null
  source_label?: string | null
  priority?: SignalPriority | null
  lead_score?: number | null
  recommendation?: string | null
  notes?: string | null
  status?: LeadStatus
  closed_reason?: string | null
}

export type LeadSortField =
  | 'title'
  | 'lead_score'
  | 'status'
  | 'source_label'
  | 'priority'
  | 'created_at'

export type SortDirection = 'asc' | 'desc'
