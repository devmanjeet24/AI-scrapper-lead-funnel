import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/types/lead'

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: 'border-primary/25 bg-primary-soft text-primary',
  contacted: 'border-blue-200 bg-blue-50 text-blue-700',
  won: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  lost: 'border-red-200 bg-red-50 text-red-700',
  archived: 'border-border bg-section-alt text-muted',
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  won: 'Won',
  lost: 'Lost',
  archived: 'Archived',
}

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
