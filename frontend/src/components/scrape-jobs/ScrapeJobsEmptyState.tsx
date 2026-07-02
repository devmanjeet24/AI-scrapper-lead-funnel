import { Globe, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ScrapeJobsEmptyStateProps {
  hasFilters: boolean
  onCreateJob: () => void
}

export function ScrapeJobsEmptyState({ hasFilters, onCreateJob }: ScrapeJobsEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border/80',
        'bg-surface-solid px-6 py-16 text-center shadow-[var(--shadow-soft)]',
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-foreground/5 text-foreground/60">
        <Globe className="size-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        {hasFilters ? 'No jobs match your filters' : 'No scrape jobs yet'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you are looking for.'
          : 'Create your first scrape job to monitor a target URL and generate signals automatically.'}
      </p>
      {!hasFilters ? (
        <button
          type="button"
          onClick={onCreateJob}
          className={cn(
            'mt-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-2.5',
            'text-sm font-semibold text-white shadow-[var(--shadow-button)]',
            'transition-shadow hover:shadow-[var(--shadow-button-hover)]',
          )}
        >
          <Plus className="size-4" />
          Create Job
        </button>
      ) : null}
    </div>
  )
}
