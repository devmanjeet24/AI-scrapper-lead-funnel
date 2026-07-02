import { Calendar } from 'lucide-react'

interface AppointmentsEmptyStateProps {
  tabLabel: string
  hasFilters: boolean
  onBookFromOutreach?: () => void
}

export function AppointmentsEmptyState({
  tabLabel,
  hasFilters,
  onBookFromOutreach,
}: AppointmentsEmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-border/80 bg-surface-solid px-6 py-14 text-center shadow-[var(--shadow-soft)]">
      <Calendar className="mx-auto size-10 text-muted/50" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        {hasFilters ? 'No appointments match your filters' : `No ${tabLabel.toLowerCase()} appointments`}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        {hasFilters
          ? 'Try adjusting your search or switching tabs.'
          : 'Qualified outreach conversations can be booked from the conversation workspace or outreach handoff flow.'}
      </p>
      {!hasFilters && onBookFromOutreach ? (
        <button
          type="button"
          onClick={onBookFromOutreach}
          className="mt-5 text-sm font-semibold text-primary hover:underline"
        >
          Go to outreach
        </button>
      ) : null}
    </div>
  )
}
