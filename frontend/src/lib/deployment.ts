import type {
  MonitoringAlertLevel,
  MonitoringAnalysis,
  MonitoringRecommendation,
  MonitoringSnapshot,
} from '@/types/deployment'

const RECOMMENDATION_LABELS: Record<MonitoringRecommendation, string> = {
  continue: 'Continue',
  optimize: 'Optimize',
  pause: 'Pause',
  scale: 'Scale',
  investigate: 'Investigate',
}

const ALERT_LEVEL_STYLES: Record<MonitoringAlertLevel, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  critical: 'border-red-200 bg-red-50 text-red-700',
}

export function getMonitoringRecommendationLabel(
  recommendation: MonitoringRecommendation,
): string {
  return RECOMMENDATION_LABELS[recommendation]
}

export function getMonitoringAlertLevelStyle(level: MonitoringAlertLevel): string {
  return ALERT_LEVEL_STYLES[level] ?? ALERT_LEVEL_STYLES.info
}

function isMonitoringRecommendation(value: unknown): value is MonitoringRecommendation {
  return (
    value === 'continue' ||
    value === 'optimize' ||
    value === 'pause' ||
    value === 'scale' ||
    value === 'investigate'
  )
}

function isMonitoringAlertLevel(value: unknown): value is MonitoringAlertLevel {
  return value === 'info' || value === 'warning' || value === 'critical'
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

export function parseMonitoringAnalysis(payload: Record<string, unknown>): MonitoringAnalysis | null {
  if (!isMonitoringRecommendation(payload.recommendation)) return null
  if (typeof payload.health_score !== 'number') return null
  if (typeof payload.summary !== 'string' || !payload.summary.trim()) return null

  const alertLevel = isMonitoringAlertLevel(payload.alert_level) ? payload.alert_level : 'info'

  return {
    recommendation: payload.recommendation,
    health_score: payload.health_score,
    summary: payload.summary.trim(),
    key_findings: parseStringArray(payload.key_findings),
    action_items: parseStringArray(payload.action_items),
    suggested_budget_change:
      typeof payload.suggested_budget_change === 'string'
        ? payload.suggested_budget_change
        : null,
    creative_suggestions: parseStringArray(payload.creative_suggestions),
    alert_level: alertLevel,
    analyzed_at: typeof payload.analyzed_at === 'string' ? payload.analyzed_at : undefined,
  }
}

export function getLatestMonitoringAnalysis(
  agentMetadata: Record<string, unknown>,
): MonitoringAnalysis | null {
  const latest = agentMetadata.latest_monitoring_analysis
  if (!latest || typeof latest !== 'object') return null
  return parseMonitoringAnalysis(latest as Record<string, unknown>)
}

export function getSnapshotAnalysis(snapshot: MonitoringSnapshot): MonitoringAnalysis | null {
  if (!snapshot.agent_analysis) return null
  return parseMonitoringAnalysis(snapshot.agent_analysis)
}

export interface MonitoringMetricDisplay {
  key: string
  label: string
  value: string
}

const METRIC_LABELS: Record<string, string> = {
  impressions: 'Impressions',
  clicks: 'Clicks',
  spend: 'Spend',
  conversions: 'Conversions',
  ctr: 'CTR',
  cpc: 'CPC',
}

function formatMetricValue(key: string, value: unknown): string {
  if (typeof value === 'number') {
    if (key === 'spend' || key === 'cpc') {
      return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
    }
    if (key === 'ctr') {
      return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
    }
    return value.toLocaleString()
  }
  if (typeof value === 'string' && value.trim()) return value
  return '—'
}

export function formatMonitoringMetrics(metrics: Record<string, unknown>): MonitoringMetricDisplay[] {
  const preferredOrder = ['impressions', 'clicks', 'spend', 'conversions', 'ctr', 'cpc']
  const entries = Object.entries(metrics).filter(([, value]) => value !== null && value !== undefined)

  const sorted = entries.sort(([keyA], [keyB]) => {
    const indexA = preferredOrder.indexOf(keyA)
    const indexB = preferredOrder.indexOf(keyB)
    if (indexA === -1 && indexB === -1) return keyA.localeCompare(keyB)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return sorted.map(([key, value]) => ({
    key,
    label: METRIC_LABELS[key] ?? key.replace(/_/g, ' '),
    value: formatMetricValue(key, value),
  }))
}
