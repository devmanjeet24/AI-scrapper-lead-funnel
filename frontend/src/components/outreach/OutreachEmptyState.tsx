import { Plus, Send } from 'lucide-react'

import { cn } from '@/lib/utils'

interface OutreachEmptyStateProps {
  hasFilters: boolean
  onCreateCampaign: () => void
}

export function OutreachEmptyState({ hasFilters, onCreateCampaign }: OutreachEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border/80',
        'bg-surface-solid px-6 py-16 text-center shadow-[var(--shadow-soft)]',
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-foreground/5 text-foreground/60">
        <Send className="size-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        {hasFilters ? 'No campaigns match your filters' : 'No outreach campaigns yet'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted">
        {hasFilters
          ? 'Try adjusting your search or filters to find what you are looking for.'
          : 'Start a campaign for a lead to draft AI outreach and begin a conversation thread.'}
      </p>
      {!hasFilters ? (
        <button
          type="button"
          onClick={onCreateCampaign}
          className={cn(
            'mt-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-2.5',
            'text-sm font-semibold text-white shadow-[var(--shadow-button)]',
            'transition-shadow hover:shadow-[var(--shadow-button-hover)]',
          )}
        >
          <Plus className="size-4" />
          Start Campaign
        </button>
      ) : null}
    </div>
  )
}
