import type { ScrapeJob, ScrapeJobSortField, ScrapeResult, SortDirection } from '@/types/scrape'

export { SOURCE_TYPE_OPTIONS } from '@/lib/signals'
export { PAGE_SIZE, SEARCH_FETCH_LIMIT } from '@/lib/leads'

export const SCRAPE_JOB_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
] as const

export const SCRAPE_ACTIVE_OPTIONS = [
  { value: 'true', label: 'Active jobs' },
  { value: 'false', label: 'Inactive jobs' },
] as const

const STATUS_ORDER: Record<string, number> = {
  active: 1,
  draft: 2,
  paused: 3,
  archived: 4,
}

function compareNullableStrings(a: string | null | undefined, b: string | null | undefined) {
  const left = (a ?? '').toLowerCase()
  const right = (b ?? '').toLowerCase()
  return left.localeCompare(right)
}

export function filterScrapeJobsBySearch(jobs: ScrapeJob[], query: string): ScrapeJob[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return jobs

  return jobs.filter((job) => {
    const haystack = [
      job.name,
      job.description,
      job.target_url,
      job.source_type,
      job.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalized)
  })
}

export function sortScrapeJobs(
  jobs: ScrapeJob[],
  field: ScrapeJobSortField,
  direction: SortDirection,
): ScrapeJob[] {
  const sorted = [...jobs].sort((a, b) => {
    let result = 0

    switch (field) {
      case 'name':
        result = compareNullableStrings(a.name, b.name)
        break
      case 'source_type':
        result = compareNullableStrings(a.source_type, b.source_type)
        break
      case 'status':
        result = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
        break
      case 'target_url':
        result = compareNullableStrings(a.target_url, b.target_url)
        break
      case 'last_run_at':
        result =
          new Date(a.last_run_at ?? 0).getTime() - new Date(b.last_run_at ?? 0).getTime()
        break
      case 'created_at':
        result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
    }

    return direction === 'asc' ? result : -result
  })

  return sorted
}

export function isScrapeResultTerminal(status: ScrapeResult['status']): boolean {
  return status === 'success' || status === 'failed' || status === 'cancelled'
}

export function getSignalsCreatedFromResult(result: ScrapeResult): number | null {
  const aiAnalysis = result.metadata?.ai_analysis
  if (!aiAnalysis || typeof aiAnalysis !== 'object') return null
  const created = (aiAnalysis as { signals_created?: unknown }).signals_created
  return typeof created === 'number' ? created : null
}

export function canRunScrapeJob(job: ScrapeJob): boolean {
  return job.status !== 'archived' && job.is_active
}
