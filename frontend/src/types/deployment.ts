export type DeploymentPackageStatus = 'ready' | 'deployed' | 'failed'

export type DeploymentMode = 'export' | 'facebook_ads' | 'google_ads' | 'linkedin_ads'

export interface DeploymentPackage {
  id: string
  organization_id: string
  creative_set_id: string
  lead_id: string
  created_by_id: string | null
  status: DeploymentPackageStatus
  channel_hint: string | null
  payload: Record<string, unknown>
  deploy_result: Record<string, unknown> | null
  deployed_at: string | null
  error_message: string | null
  agent_metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface PaginatedDeploymentPackagesResponse {
  items: DeploymentPackage[]
  total: number
  limit: number
  offset: number
}

export interface DeploymentPackageCreateRequest {
  channel_hint?: string | null
}

export interface DeploymentExecuteRequest {
  mode?: DeploymentMode
}

export interface DeploymentAnalyzeRequest {
  mode?: DeploymentMode
}

export type MonitoringRecommendation =
  | 'continue'
  | 'optimize'
  | 'pause'
  | 'scale'
  | 'investigate'

export type MonitoringSnapshotSource = 'manual' | 'simulated' | 'api'

export type MonitoringAlertLevel = 'info' | 'warning' | 'critical'

export interface MonitoringSnapshot {
  id: string
  organization_id: string
  deployment_package_id: string
  recorded_by_id: string | null
  recorded_at: string
  source: MonitoringSnapshotSource
  metrics: Record<string, unknown>
  agent_analysis: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface PaginatedMonitoringSnapshotsResponse {
  items: MonitoringSnapshot[]
  total: number
  limit: number
  offset: number
}

export interface MonitoringSnapshotCreateRequest {
  impressions?: number
  clicks?: number
  spend?: number
  conversions?: number
  ctr?: number | null
  cpc?: number | null
  extra?: Record<string, unknown>
}

export interface MonitoringAnalysis {
  recommendation: MonitoringRecommendation
  health_score: number
  summary: string
  key_findings: string[]
  action_items: string[]
  suggested_budget_change: string | null
  creative_suggestions: string[]
  alert_level: MonitoringAlertLevel
  analyzed_at?: string
}

export interface MonitoringAnalysisResponse extends MonitoringAnalysis {
  package: DeploymentPackage
}
