import { cn } from '@/lib/utils'
import type { DeploymentPackageStatus } from '@/types/deployment'

const STATUS_STYLES: Record<DeploymentPackageStatus, string> = {
  ready: 'border-blue-200 bg-blue-50 text-blue-700',
  deployed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  failed: 'border-red-200 bg-red-50 text-red-700',
}

const STATUS_LABELS: Record<DeploymentPackageStatus, string> = {
  ready: 'Ready',
  deployed: 'Deployed',
  failed: 'Failed',
}

interface DeploymentStatusBadgeProps {
  status: DeploymentPackageStatus
  className?: string
}

export function DeploymentStatusBadge({ status, className }: DeploymentStatusBadgeProps) {
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
