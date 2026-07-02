import { Filter, Plus, Search } from 'lucide-react'
import { useState } from 'react'

import {
  OutreachFiltersPanel,
  type OutreachFilters,
} from '@/components/outreach/OutreachFiltersPanel'
import { cn } from '@/lib/utils'
import type { Lead } from '@/types/lead'

interface OutreachPageHeaderProps {
  totalCount: number
  displayedCount: number
  searchQuery: string
  filters: OutreachFilters
  leads: Lead[]
  onSearchChange: (value: string) => void
  onFiltersChange: (filters: OutreachFilters) => void
  onCreateCampaign: () => void
}

export function OutreachPageHeader({
  totalCount,
  displayedCount,
  searchQuery,
  filters,
  leads,
  onSearchChange,
  onFiltersChange,
  onCreateCampaign,
}: OutreachPageHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilterCount = [filters.status, filters.lead_id].filter(Boolean).length

  return (
    <header className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Outreach
          </h1>
          <p className="mt-1 text-sm text-muted">
            {displayedCount === totalCount
              ? `${totalCount} campaign${totalCount === 1 ? '' : 's'}`
              : `Showing ${displayedCount} of ${totalCount} campaigns`}
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateCampaign}
          className={cn(
            'inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-[var(--radius-button)]',
            'bg-primary px-5 py-3 text-sm font-semibold text-white',
            'shadow-[var(--shadow-button)] transition-shadow hover:shadow-[var(--shadow-button-hover)]',
          )}
        >
          <Plus className="size-4" />
          Start Campaign
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search campaigns…"
            className={cn(
              'w-full rounded-xl border border-border/80 bg-surface-solid py-2.5 pl-10 pr-4 text-sm text-foreground',
              'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
            )}
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={cn(
              'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/80',
              'bg-surface-solid px-4 py-2.5 text-sm font-medium text-foreground transition-colors sm:w-auto',
              'hover:bg-section-alt',
              activeFilterCount > 0 && 'border-border-strong bg-foreground/[0.04]',
            )}
          >
            <Filter className="size-4" />
            Filter
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <OutreachFiltersPanel
            open={filtersOpen}
            filters={filters}
            leads={leads}
            onChange={onFiltersChange}
            onClose={() => setFiltersOpen(false)}
          />
        </div>
      </div>
    </header>
  )
}
