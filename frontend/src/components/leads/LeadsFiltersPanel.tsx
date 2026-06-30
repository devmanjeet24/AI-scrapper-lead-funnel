import { SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { LEAD_PRIORITY_OPTIONS, LEAD_STATUS_OPTIONS } from '@/lib/leads'
import { cn } from '@/lib/utils'
import type { LeadStatus, SignalPriority } from '@/types/lead'

export interface LeadFilters {
  status?: LeadStatus
  priority?: SignalPriority
}

interface LeadsFiltersPanelProps {
  open: boolean
  filters: LeadFilters
  onChange: (filters: LeadFilters) => void
  onClose: () => void
}

export function LeadsFiltersPanel({
  open,
  filters,
  onChange,
  onClose,
}: LeadsFiltersPanelProps) {
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

  const activeCount = [filters.status, filters.priority].filter(Boolean).length

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
          <SlidersHorizontal className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
          {activeCount > 0 ? (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
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
          <label htmlFor="filter-status" className="text-xs font-medium text-muted">
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status ?? ''}
            onChange={(event) =>
              onChange({
                ...filters,
                status: (event.target.value as LeadStatus) || undefined,
              })
            }
            className={cn(
              'w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
            )}
          >
            <option value="">All statuses</option>
            {LEAD_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="filter-priority" className="text-xs font-medium text-muted">
            Priority
          </label>
          <select
            id="filter-priority"
            value={filters.priority ?? ''}
            onChange={(event) =>
              onChange({
                ...filters,
                priority: (event.target.value as SignalPriority) || undefined,
              })
            }
            className={cn(
              'w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground',
              'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
            )}
          >
            <option value="">All priorities</option>
            {LEAD_PRIORITY_OPTIONS.map((option) => (
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
