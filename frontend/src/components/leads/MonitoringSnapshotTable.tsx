import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

import { MonitoringSnapshotSourceBadge } from '@/components/leads/MonitoringSnapshotSourceBadge'
import { formatMonitoringMetrics } from '@/lib/deployment'
import type { MonitoringSnapshot } from '@/types/deployment'

interface MonitoringSnapshotTableProps {
  snapshots: MonitoringSnapshot[]
  isLoading?: boolean
}

export function MonitoringSnapshotTable({ snapshots, isLoading }: MonitoringSnapshotTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 px-4 py-8 text-sm text-muted">
        <Loader2 className="size-4 animate-spin" />
        Loading snapshots…
      </div>
    )
  }

  if (snapshots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-section-alt/30 px-4 py-6 text-center">
        <p className="text-sm font-medium text-foreground">No performance snapshots yet</p>
        <p className="mt-1 text-xs text-muted">
          Record campaign metrics or add a test snapshot before running AI monitoring analysis.
        </p>
      </div>
    )
  }

  const ordered = [...snapshots].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
  )

  return (
    <div className="space-y-2">
      {ordered.map((snapshot) => {
        const metrics = formatMonitoringMetrics(snapshot.metrics)

        return (
          <div
            key={snapshot.id}
            className="rounded-xl border border-border/80 bg-background/60 px-3 py-2.5"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <MonitoringSnapshotSourceBadge source={snapshot.source} />
              <span className="ml-auto text-[10px] text-muted">
                {format(new Date(snapshot.recorded_at), 'MMM d, yyyy · h:mm a')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.key} className="rounded-lg bg-section-alt/50 px-2.5 py-2">
                  <p className="text-[10px] font-medium text-muted">{metric.label}</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
