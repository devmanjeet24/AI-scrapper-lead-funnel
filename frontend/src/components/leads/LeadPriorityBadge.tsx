import { cn } from '@/lib/utils'
import type { SignalPriority } from '@/types/lead'

const PRIORITY_STYLES: Record<SignalPriority, string> = {
  high: 'border-red-200 bg-red-50 text-red-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-700',
  low: 'border-border bg-section-alt text-muted',
}

const PRIORITY_LABELS: Record<SignalPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

interface LeadPriorityBadgeProps {
  priority: SignalPriority | null
  className?: string
}

export function LeadPriorityBadge({ priority, className }: LeadPriorityBadgeProps) {
  if (!priority) {
    return <span className={cn('text-sm text-muted', className)}>—</span>
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        PRIORITY_STYLES[priority],
        className,
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
