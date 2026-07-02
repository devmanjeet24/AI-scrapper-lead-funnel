import { cn } from '@/lib/utils'
import type { OutreachConversationStatus } from '@/types/outreach'

const STATUS_STYLES: Record<OutreachConversationStatus, string> = {
  open: 'border-blue-200 bg-blue-50 text-blue-700',
  qualified: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  disqualified: 'border-red-200 bg-red-50 text-red-700',
  handoff: 'border-violet-200 bg-violet-50 text-violet-700',
  closed: 'border-border bg-section-alt text-muted',
}

const STATUS_LABELS: Record<OutreachConversationStatus, string> = {
  open: 'Open',
  qualified: 'Qualified',
  disqualified: 'Disqualified',
  handoff: 'Handoff',
  closed: 'Closed',
}

interface OutreachConversationStatusBadgeProps {
  status: OutreachConversationStatus
  className?: string
}

export function OutreachConversationStatusBadge({
  status,
  className,
}: OutreachConversationStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
