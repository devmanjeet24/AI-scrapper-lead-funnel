export type OutreachCampaignStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed'

export type OutreachChannel = 'internal' | 'email' | 'sms' | 'voice'

export type OutreachConversationStatus =
  | 'open'
  | 'qualified'
  | 'disqualified'
  | 'handoff'
  | 'closed'

export type OutreachMessageRole = 'agent' | 'lead' | 'system'

export type QualificationVerdict =
  | 'qualified'
  | 'needs_more_info'
  | 'disqualified'
  | 'handoff'

export interface OutreachCampaign {
  id: string
  organization_id: string
  lead_id: string
  deployment_package_id: string | null
  created_by_id: string | null
  status: OutreachCampaignStatus
  channel: OutreachChannel
  subject: string | null
  recipient_email: string | null
  recipient_phone: string | null
  agent_metadata: Record<string, unknown>
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface OutreachConversation {
  id: string
  organization_id: string
  campaign_id: string
  lead_id: string
  status: OutreachConversationStatus
  qualification_score: number | null
  qualification_verdict: QualificationVerdict | null
  vetting_result: Record<string, unknown> | null
  summary: string | null
  created_at: string
  updated_at: string
}

export interface OutreachMessage {
  id: string
  organization_id: string
  conversation_id: string
  role: OutreachMessageRole
  channel: OutreachChannel
  subject: string | null
  content: string
  delivery_metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PaginatedOutreachCampaignsResponse {
  items: OutreachCampaign[]
  total: number
  limit: number
  offset: number
}

export interface PaginatedOutreachMessagesResponse {
  items: OutreachMessage[]
  total: number
  limit: number
  offset: number
}

export interface OutreachCampaignCreateRequest {
  channel?: OutreachChannel
  subject?: string | null
  recipient_email?: string | null
  recipient_phone?: string | null
}

export interface OutreachCampaignListParams {
  lead_id?: string
  status?: OutreachCampaignStatus
  limit?: number
  offset?: number
}

export type OutreachCampaignSortField =
  | 'subject'
  | 'channel'
  | 'status'
  | 'created_at'

export type SortDirection = 'asc' | 'desc'

export interface LeadReplyCreateRequest {
  content: string
  auto_vet?: boolean
}

export interface VettingResponse {
  conversation: OutreachConversation
  qualification_score: number
  qualification_verdict: QualificationVerdict
  summary: string
  recommended_next_step: string
  buying_signals: string[]
  red_flags: string[]
}

export interface VettingInsights {
  qualification_score: number | null
  qualification_verdict: QualificationVerdict | null
  summary: string | null
  recommended_next_step: string | null
  buying_signals: string[]
  red_flags: string[]
}
