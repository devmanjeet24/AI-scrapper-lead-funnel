import { cn } from '@/lib/utils'
import type { AppointmentStatus } from '@/types/appointment'

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  proposed: 'border-blue-200 bg-blue-50 text-blue-700',
  pending_confirmation: 'border-amber-200 bg-amber-50 text-amber-700',
  confirmed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-border bg-section-alt text-muted',
  failed: 'border-red-200 bg-red-50 text-red-700',
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  proposed: 'Proposed',
  pending_confirmation: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  failed: 'Failed',
}

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus
  className?: string
}

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
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
