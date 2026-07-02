import { cn } from '@/lib/utils'
import type { ScrapeResultStatus } from '@/types/scrape'

const STATUS_STYLES: Record<ScrapeResultStatus, string> = {
  pending: 'border-border bg-section-alt text-muted',
  running: 'border-blue-200 bg-blue-50 text-blue-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
  cancelled: 'border-border bg-section-alt text-muted',
}

const STATUS_LABELS: Record<ScrapeResultStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  success: 'Success',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

interface ScrapeResultStatusBadgeProps {
  status: ScrapeResultStatus
  className?: string
}

export function ScrapeResultStatusBadge({ status, className }: ScrapeResultStatusBadgeProps) {
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
