import { cn } from '@/lib/utils'
import type { SignalStatus } from '@/types/signal'

const STATUS_STYLES: Record<SignalStatus, string> = {
  new: 'border-primary/25 bg-primary-soft text-primary',
  reviewed: 'border-blue-200 bg-blue-50 text-blue-700',
  qualified: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  dismissed: 'border-border bg-section-alt text-muted',
  converted: 'border-violet-200 bg-violet-50 text-violet-700',
  duplicate: 'border-border bg-section-alt text-muted',
}

const STATUS_LABELS: Record<SignalStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  qualified: 'Qualified',
  dismissed: 'Dismissed',
  converted: 'Converted',
  duplicate: 'Duplicate',
}

interface SignalStatusBadgeProps {
  status: SignalStatus
  className?: string
}

export function SignalStatusBadge({ status, className }: SignalStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
