import { cn } from '@/lib/utils'
import type { MonitoringSnapshotSource } from '@/types/deployment'

const SOURCE_LABELS: Record<MonitoringSnapshotSource, string> = {
  manual: 'Manual',
  simulated: 'Simulated',
  api: 'API',
}

const SOURCE_STYLES: Record<MonitoringSnapshotSource, string> = {
  manual: 'border-border bg-section-alt/60 text-muted',
  simulated: 'border-amber-200/80 bg-amber-50/60 text-amber-800',
  api: 'border-emerald-200/80 bg-emerald-50/60 text-emerald-700',
}

interface MonitoringSnapshotSourceBadgeProps {
  source: MonitoringSnapshotSource
  className?: string
}

export function MonitoringSnapshotSourceBadge({
  source,
  className,
}: MonitoringSnapshotSourceBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
        SOURCE_STYLES[source],
        className,
      )}
    >
      {SOURCE_LABELS[source]}
    </span>
  )
}
