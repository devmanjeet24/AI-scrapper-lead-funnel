import type { Lead, LeadSortField, SortDirection } from '@/types/lead'

export function getLeadCompany(lead: Lead): string {
  const company = lead.extracted_data.company
  if (typeof company === 'string' && company.trim().length > 0) {
    return company.trim()
  }
  return lead.title
}

export function getLeadSourceSignal(lead: Lead): string | null {
  if (lead.source_label?.trim()) {
    return lead.source_label.trim()
  }
  if (lead.signal_id) {
    return `Signal ${lead.signal_id.slice(0, 8)}`
  }
  return null
}

export function filterLeadsBySearch(leads: Lead[], query: string): Lead[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return leads

  return leads.filter((lead) => {
    const haystack = [
      getLeadCompany(lead),
      lead.title,
      lead.summary,
      lead.source_label,
      lead.status,
      lead.priority,
      lead.lead_score?.toString(),
      getLeadSourceSignal(lead),
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
  contacted: 2,
  won: 3,
  lost: 4,
  archived: 5,
}

function compareNullableStrings(a: string | null | undefined, b: string | null | undefined) {
  const left = (a ?? '').toLowerCase()
  const right = (b ?? '').toLowerCase()
  return left.localeCompare(right)
}

export function sortLeads(
  leads: Lead[],
  field: LeadSortField,
  direction: SortDirection,
): Lead[] {
  const sorted = [...leads].sort((a, b) => {
    let result = 0

    switch (field) {
      case 'title':
        result = compareNullableStrings(getLeadCompany(a), getLeadCompany(b))
        break
      case 'lead_score':
        result = (a.lead_score ?? -1) - (b.lead_score ?? -1)
        break
      case 'status':
        result = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
        break
      case 'source_label':
        result = compareNullableStrings(getLeadSourceSignal(a), getLeadSourceSignal(b))
        break
      case 'priority':
        result =
          (PRIORITY_ORDER[a.priority ?? ''] ?? 0) - (PRIORITY_ORDER[b.priority ?? ''] ?? 0)
        break
      case 'created_at':
        result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
    }

    return direction === 'asc' ? result : -result
  })

  return sorted
}

export const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'archived', label: 'Archived' },
] as const

export const LEAD_PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const

export const PAGE_SIZE = 20
export const SEARCH_FETCH_LIMIT = 100
