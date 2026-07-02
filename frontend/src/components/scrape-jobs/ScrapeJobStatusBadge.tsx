import { cn } from '@/lib/utils'
import type { ScrapeJobStatus } from '@/types/scrape'

const STATUS_STYLES: Record<ScrapeJobStatus, string> = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  draft: 'border-border bg-section-alt text-muted',
  paused: 'border-amber-200 bg-amber-50 text-amber-700',
  archived: 'border-border bg-section-alt text-muted',
}

const STATUS_LABELS: Record<ScrapeJobStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  paused: 'Paused',
  archived: 'Archived',
}

interface ScrapeJobStatusBadgeProps {
  status: ScrapeJobStatus
  className?: string
}

export function ScrapeJobStatusBadge({ status, className }: ScrapeJobStatusBadgeProps) {
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
