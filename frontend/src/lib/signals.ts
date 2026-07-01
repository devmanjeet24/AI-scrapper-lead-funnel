import type { Signal, SignalSortField, SortDirection } from '@/types/signal'

export function getSignalLeadScore(signal: Signal): number | null {
  const score = signal.extracted_data.lead_score
  return typeof score === 'number' ? score : null
}

export function getSignalDetectedAt(signal: Signal): string {
  return signal.detected_at ?? signal.created_at
}

export function getSignalRecommendation(signal: Signal): string | null {
  const recommendation = signal.extracted_data.recommendation
  return typeof recommendation === 'string' && recommendation.trim().length > 0
    ? recommendation.trim()
    : null
}

export function formatConfidenceScore(score: number | null): string | null {
  if (score === null) return null
  return `${Math.round(score * 100)}%`
}

export function canConvertSignal(status: Signal['status']): boolean {
  return status !== 'converted' && status !== 'dismissed' && status !== 'duplicate'
}

export function filterSignalsBySearch(signals: Signal[], query: string): Signal[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return signals

  return signals.filter((signal) => {
    const haystack = [
      signal.title,
      signal.summary,
      signal.source_label,
      signal.source_url,
      signal.status,
      signal.priority,
      signal.signal_type,
      signal.source_type,
      getSignalLeadScore(signal)?.toString(),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalized)
  })
}

const PRIORITY_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 }
const STATUS_ORDER: Record<string, number> = {
  new: 1,
  reviewed: 2,
  qualified: 3,
  converted: 4,
  dismissed: 5,
  duplicate: 6,
}

function compareNullableStrings(a: string | null | undefined, b: string | null | undefined) {
  const left = (a ?? '').toLowerCase()
  const right = (b ?? '').toLowerCase()
  return left.localeCompare(right)
}

export function sortSignals(
  signals: Signal[],
  field: SignalSortField,
  direction: SortDirection,
): Signal[] {
  const sorted = [...signals].sort((a, b) => {
    let result = 0

    switch (field) {
      case 'title':
        result = compareNullableStrings(a.title, b.title)
        break
      case 'lead_score':
        result = (getSignalLeadScore(a) ?? -1) - (getSignalLeadScore(b) ?? -1)
        break
      case 'status':
        result = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
        break
      case 'signal_type':
        result = compareNullableStrings(a.signal_type, b.signal_type)
        break
      case 'source_label':
        result = compareNullableStrings(a.source_label, b.source_label)
        break
      case 'priority':
        result =
          (PRIORITY_ORDER[a.priority ?? ''] ?? 0) - (PRIORITY_ORDER[b.priority ?? ''] ?? 0)
        break
      case 'detected_at':
        result =
          new Date(getSignalDetectedAt(a)).getTime() - new Date(getSignalDetectedAt(b)).getTime()
        break
    }

    return direction === 'asc' ? result : -result
  })

  return sorted
}

export const SIGNAL_STATUS_TABS = [
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'all', label: 'All' },
] as const

export type SignalStatusTab = (typeof SIGNAL_STATUS_TABS)[number]['value']

export const SIGNAL_TYPE_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'competitor_intel', label: 'Competitor Intel' },
  { value: 'review', label: 'Review' },
  { value: 'mention', label: 'Mention' },
  { value: 'hiring', label: 'Hiring' },
  { value: 'pricing_change', label: 'Pricing Change' },
  { value: 'news', label: 'News' },
  { value: 'other', label: 'Other' },
] as const

export const SOURCE_TYPE_OPTIONS = [
  { value: 'web', label: 'Web' },
  { value: 'social', label: 'Social' },
  { value: 'competitor', label: 'Competitor' },
  { value: 'review', label: 'Review' },
  { value: 'other', label: 'Other' },
] as const

export { PAGE_SIZE, SEARCH_FETCH_LIMIT } from '@/lib/leads'
