import { AlertCircle, RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'

interface OutreachErrorStateProps {
  message: string
  onRetry: () => void
}

export function OutreachErrorState({ message, onRetry }: OutreachErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-red-200/80',
        'bg-red-50/50 px-6 py-16 text-center shadow-[var(--shadow-soft)]',
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertCircle className="size-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">Failed to load outreach campaigns</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          'mt-6 inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-border px-5 py-2.5',
          'text-sm font-semibold text-foreground transition-colors hover:bg-section-alt',
        )}
      >
        <RefreshCw className="size-4" />
        Try again
      </button>
    </div>
  )
}
