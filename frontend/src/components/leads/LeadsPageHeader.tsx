import { ChevronLeft, ChevronRight, Filter, Plus, Search } from 'lucide-react'
import { useState } from 'react'

import { LeadsFiltersPanel, type LeadFilters } from '@/components/leads/LeadsFiltersPanel'
import { cn } from '@/lib/utils'

interface LeadsPageHeaderProps {
  totalCount: number
  displayedCount: number
  searchQuery: string
  filters: LeadFilters
  onSearchChange: (value: string) => void
  onFiltersChange: (filters: LeadFilters) => void
  onCreateLead: () => void
}

export function LeadsPageHeader({
  totalCount,
  displayedCount,
  searchQuery,
  filters,
  onSearchChange,
  onFiltersChange,
  onCreateLead,
}: LeadsPageHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilterCount = [filters.status, filters.priority].filter(Boolean).length

  return (
    <header className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Leads
          </h1>
          <p className="mt-1 text-sm text-muted">
            {displayedCount === totalCount
              ? `${totalCount} lead${totalCount === 1 ? '' : 's'}`
              : `Showing ${displayedCount} of ${totalCount} leads`}
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateLead}
          className={cn(
            'inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-[var(--radius-button)]',
            'bg-primary px-5 py-3 text-sm font-semibold text-white',
            'shadow-[0_8px_24px_rgb(28_200_141/0.35)] transition-shadow hover:shadow-[0_12px_32px_rgb(28_200_141/0.45)]',
          )}
        >
          <Plus className="size-4" />
          Create Lead
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search leads…"
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
              activeFilterCount > 0 && 'border-primary/30 bg-primary-soft/50',
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
          <LeadsFiltersPanel
            open={filtersOpen}
            filters={filters}
            onChange={(next) => {
              onFiltersChange(next)
            }}
            onClose={() => setFiltersOpen(false)}
          />
        </div>
      </div>
    </header>
  )
}

interface LeadsPaginationProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function LeadsPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: LeadsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  if (totalItems <= pageSize) return null

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            'inline-flex items-center gap-1 rounded-xl border border-border/80 px-3 py-2 text-sm font-medium',
            'text-foreground transition-colors hover:bg-section-alt disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          <ChevronLeft className="size-4" />
          Previous
        </button>
        <span className="px-2 text-sm text-muted">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            'inline-flex items-center gap-1 rounded-xl border border-border/80 px-3 py-2 text-sm font-medium',
            'text-foreground transition-colors hover:bg-section-alt disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          Next
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
