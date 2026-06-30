import { Plus, Users } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LeadsEmptyStateProps {
  hasFilters: boolean
  onCreateLead: () => void
}

export function LeadsEmptyState({ hasFilters, onCreateLead }: LeadsEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border/80',
        'bg-surface-solid px-6 py-16 text-center shadow-[var(--shadow-soft)]',
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Users className="size-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        {hasFilters ? 'No leads match your filters' : 'No leads yet'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you are looking for.'
          : 'Create your first lead to start tracking prospects through your pipeline.'}
      </p>
      {!hasFilters ? (
        <button
          type="button"
          onClick={onCreateLead}
          className={cn(
            'mt-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-2.5',
            'text-sm font-semibold text-white shadow-[0_8px_24px_rgb(28_200_141/0.35)]',
            'transition-shadow hover:shadow-[0_12px_32px_rgb(28_200_141/0.45)]',
          )}
        >
          <Plus className="size-4" />
          Create Lead
        </button>
      ) : null}
    </div>
  )
}
