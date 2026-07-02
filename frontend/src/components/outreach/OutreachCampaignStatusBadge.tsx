import { cn } from '@/lib/utils'
import type { OutreachCampaignStatus } from '@/types/outreach'

const STATUS_STYLES: Record<OutreachCampaignStatus, string> = {
  draft: 'border-border bg-section-alt text-muted',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  paused: 'border-amber-200 bg-amber-50 text-amber-700',
  completed: 'border-blue-200 bg-blue-50 text-blue-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
}

const STATUS_LABELS: Record<OutreachCampaignStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
}

interface OutreachCampaignStatusBadgeProps {
  status: OutreachCampaignStatus
  className?: string
}

export function OutreachCampaignStatusBadge({
  status,
  className,
}: OutreachCampaignStatusBadgeProps) {
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
