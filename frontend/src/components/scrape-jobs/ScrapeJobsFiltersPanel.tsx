import { SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import {
  SCRAPE_ACTIVE_OPTIONS,
  SCRAPE_JOB_STATUS_OPTIONS,
  SOURCE_TYPE_OPTIONS,
} from '@/lib/scrape'
import { cn } from '@/lib/utils'
import type { ScrapeJobStatus } from '@/types/scrape'
import type { ScrapeSourceType } from '@/types/signal'

export interface ScrapeJobFilters {
  status?: ScrapeJobStatus
  source_type?: ScrapeSourceType
  is_active?: boolean
}

interface ScrapeJobsFiltersPanelProps {
  open: boolean
  filters: ScrapeJobFilters
  onChange: (filters: ScrapeJobFilters) => void
  onClose: () => void
}

export function ScrapeJobsFiltersPanel({
  open,
  filters,
  onChange,
  onClose,
}: ScrapeJobsFiltersPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  const activeCount = [
    filters.status,
    filters.source_type,
    filters.is_active !== undefined,
  ].filter(Boolean).length

  return (
    <div
      ref={panelRef}
      className={cn(
        'absolute right-0 top-full z-20 mt-2 w-72 rounded-2xl border border-border/70 bg-surface-solid p-4',
        'shadow-[var(--shadow-float)]',
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted" />
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
          {activeCount > 0 ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
              {activeCount}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-muted transition-colors hover:bg-section-alt hover:text-foreground"
          aria-label="Close filters"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="filter-job-status" className="text-xs font-medium text-muted">
            Job status
          </label>
          <select
            id="filter-job-status"
            value={filters.status ?? ''}
            onChange={(event) =>
              onChange({
                ...filters,
                status: (event.target.value as ScrapeJobStatus) || undefined,
              })
            }
            className={cn(
              'w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
            )}
          >
            <option value="">All statuses</option>
            {SCRAPE_JOB_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="filter-job-source-type" className="text-xs font-medium text-muted">
            Source type
          </label>
          <select
            id="filter-job-source-type"
            value={filters.source_type ?? ''}
            onChange={(event) =>
              onChange({
                ...filters,
                source_type: (event.target.value as ScrapeSourceType) || undefined,
              })
            }
            className={cn(
              'w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
            )}
          >
            <option value="">All sources</option>
            {SOURCE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="filter-job-active" className="text-xs font-medium text-muted">
            Active state
          </label>
          <select
            id="filter-job-active"
            value={
              filters.is_active === undefined ? '' : filters.is_active ? 'true' : 'false'
            }
            onChange={(event) => {
              const value = event.target.value
              onChange({
                ...filters,
                is_active: value === '' ? undefined : value === 'true',
              })
            }}
            className={cn(
              'w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
            )}
          >
            <option value="">All jobs</option>
            {SCRAPE_ACTIVE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeCount > 0 ? (
        <button
          type="button"
          onClick={() => onChange({})}
          className="mt-4 w-full rounded-xl border border-border/80 py-2 text-xs font-medium text-muted transition-colors hover:bg-section-alt hover:text-foreground"
        >
          Clear filters
        </button>
      ) : null}
    </div>
  )
}
