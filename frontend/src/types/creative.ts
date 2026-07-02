export type CreativeSetStatus = 'pending' | 'generating' | 'completed' | 'failed'

export type CreativeAssetType =
  | 'headline'
  | 'ad_copy'
  | 'campaign_idea'
  | 'targeting_suggestion'

export type CreativeAssetStatus = 'draft' | 'approved' | 'rejected'

export interface CreativeAsset {
  id: string
  organization_id: string
  creative_set_id: string
  asset_type: CreativeAssetType
  title: string | null
  content: Record<string, unknown>
  body_text: string | null
  sort_order: number
  status: CreativeAssetStatus
  reviewed_by_id: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface CreativeSet {
  id: string
  organization_id: string
  lead_id: string
  created_by_id: string | null
  signal_id: string | null
  scrape_job_id: string | null
  scrape_result_id: string | null
  status: CreativeSetStatus
  campaign_name: string | null
  campaign_objective: string | null
  generation_params: Record<string, unknown>
  extraction_model: string | null
  agent_metadata: Record<string, unknown>
  error_message: string | null
  created_at: string
  updated_at: string
  assets: CreativeAsset[]
}

export interface PaginatedCreativeSetsResponse {
  items: CreativeSet[]
  total: number
  limit: number
  offset: number
}

export interface PaginatedCreativeAssetsResponse {
  items: CreativeAsset[]
  total: number
  limit: number
  offset: number
}

export interface CreativeGenerateRequest {
  tone?: string | null
  objective?: string | null
  max_headlines?: number
  max_ad_copy_variants?: number
  include_targeting?: boolean
}

export interface CreativeAssetUpdateRequest {
  status?: CreativeAssetStatus
  rejection_reason?: string | null
}
