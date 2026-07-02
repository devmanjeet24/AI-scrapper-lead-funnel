import { cn } from '@/lib/utils'
import type { CreativeAssetStatus } from '@/types/creative'

const STATUS_STYLES: Record<CreativeAssetStatus, string> = {
  draft: 'border-border bg-section-alt text-muted',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
}

const STATUS_LABELS: Record<CreativeAssetStatus, string> = {
  draft: 'Draft',
  approved: 'Approved',
  rejected: 'Rejected',
}

interface CreativeAssetStatusBadgeProps {
  status: CreativeAssetStatus
  className?: string
}

export function CreativeAssetStatusBadge({ status, className }: CreativeAssetStatusBadgeProps) {
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
