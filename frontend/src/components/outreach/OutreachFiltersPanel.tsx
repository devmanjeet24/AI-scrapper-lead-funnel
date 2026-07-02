import { SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { OUTREACH_CAMPAIGN_STATUS_OPTIONS } from '@/lib/outreach'
import { cn } from '@/lib/utils'
import type { Lead } from '@/types/lead'
import type { OutreachCampaignStatus } from '@/types/outreach'

export interface OutreachFilters {
  status?: OutreachCampaignStatus
  lead_id?: string
}

interface OutreachFiltersPanelProps {
  open: boolean
  filters: OutreachFilters
  leads: Lead[]
  onChange: (filters: OutreachFilters) => void
  onClose: () => void
}

export function OutreachFiltersPanel({
  open,
  filters,
  leads,
  onChange,
  onClose,
}: OutreachFiltersPanelProps) {
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

  const activeCount = [filters.status, filters.lead_id].filter(Boolean).length

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
          <label htmlFor="filter-outreach-status" className="text-xs font-medium text-muted">
            Campaign status
          </label>
          <select
            id="filter-outreach-status"
            value={filters.status ?? ''}
            onChange={(event) =>
              onChange({
                ...filters,
                status: (event.target.value as OutreachCampaignStatus) || undefined,
              })
            }
            className={cn(
              'w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
            )}
          >
            <option value="">All statuses</option>
            {OUTREACH_CAMPAIGN_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="filter-outreach-lead" className="text-xs font-medium text-muted">
            Lead
          </label>
          <select
            id="filter-outreach-lead"
            value={filters.lead_id ?? ''}
            onChange={(event) =>
              onChange({
                ...filters,
                lead_id: event.target.value || undefined,
              })
            }
            className={cn(
              'w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
            )}
          >
            <option value="">All leads</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.title}
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
