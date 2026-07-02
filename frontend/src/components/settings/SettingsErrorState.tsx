import { AlertTriangle } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SettingsErrorStateProps {
  message: string
  onRetry: () => void
}

export function SettingsErrorState({ message, onRetry }: SettingsErrorStateProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-red-200/80 bg-red-50/50 px-6 py-10 text-center',
        'shadow-[var(--shadow-soft)]',
      )}
    >
      <AlertTriangle className="mx-auto size-8 text-red-600" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">Unable to load settings</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-[var(--radius-button)] bg-primary px-5 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  )
}
