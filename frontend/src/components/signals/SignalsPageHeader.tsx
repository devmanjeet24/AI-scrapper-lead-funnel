import { ArrowRight, Filter, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

import {
  SignalsFiltersPanel,
  type SignalFilters,
} from '@/components/signals/SignalsFiltersPanel'
import { SIGNAL_STATUS_TABS, type SignalStatusTab } from '@/lib/signals'
import { cn } from '@/lib/utils'

interface SignalsPageHeaderProps {
  totalCount: number
  displayedCount: number
  searchQuery: string
  statusTab: SignalStatusTab
  filters: SignalFilters
  onSearchChange: (value: string) => void
  onStatusTabChange: (tab: SignalStatusTab) => void
  onFiltersChange: (filters: SignalFilters) => void
}

export function SignalsPageHeader({
  totalCount,
  displayedCount,
  searchQuery,
  statusTab,
  filters,
  onSearchChange,
  onStatusTabChange,
  onFiltersChange,
}: SignalsPageHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilterCount = [filters.signal_type, filters.source_type, filters.priority].filter(
    Boolean,
  ).length

  return (
    <header className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Signals
          </h1>
          <p className="mt-1 text-sm text-muted">
            {displayedCount === totalCount
              ? `${totalCount} signal${totalCount === 1 ? '' : 's'}`
              : `Showing ${displayedCount} of ${totalCount} signals`}
          </p>
        </div>

        <Link
          to="/scrape-jobs"
          className={cn(
            'inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-[var(--radius-button)]',
            'border border-border/80 bg-surface-solid px-5 py-3 text-sm font-semibold text-foreground',
            'transition-colors hover:bg-section-alt',
          )}
        >
          View Scrape Jobs
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search signals…"
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
          <SignalsFiltersPanel
            open={filtersOpen}
            filters={filters}
            onChange={onFiltersChange}
            onClose={() => setFiltersOpen(false)}
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border/60 pb-px">
        {SIGNAL_STATUS_TABS.map((tab) => {
          const isActive = statusTab === tab.value

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusTabChange(tab.value)}
              className={cn(
                'shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </header>
  )
}
