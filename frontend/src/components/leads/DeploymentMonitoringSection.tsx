import { Activity, BarChart3, Loader2, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { MonitoringAnalysisPanel } from '@/components/leads/MonitoringAnalysisPanel'
import { MonitoringSnapshotTable } from '@/components/leads/MonitoringSnapshotTable'
import { RecordMonitoringSnapshotDialog } from '@/components/leads/RecordMonitoringSnapshotDialog'
import {
  useMonitoringSnapshotsQuery,
  useRunMonitoringAnalysisMutation,
  useSimulateMonitoringSnapshotMutation,
} from '@/hooks/useDeployment'
import { getLatestMonitoringAnalysis } from '@/lib/deployment'
import { cn } from '@/lib/utils'

interface DeploymentMonitoringSectionProps {
  leadId: string
  packageId: string
  agentMetadata: Record<string, unknown>
}

export function DeploymentMonitoringSection({
  leadId,
  packageId,
  agentMetadata,
}: DeploymentMonitoringSectionProps) {
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)
  const { data: snapshotsData, isLoading } = useMonitoringSnapshotsQuery(packageId)
  const simulateMutation = useSimulateMonitoringSnapshotMutation(leadId, packageId)
  const analyzeMutation = useRunMonitoringAnalysisMutation(leadId, packageId)

  const snapshots = snapshotsData?.items ?? []
  const analysis = getLatestMonitoringAnalysis(agentMetadata)
  const isPending = simulateMutation.isPending || analyzeMutation.isPending
  const canAnalyze = snapshots.length > 0

  return (
    <div className="mt-3 space-y-3 border-t border-border/70 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <Activity className="size-3.5 text-primary" />
          Campaign monitoring
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setRecordDialogOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background disabled:opacity-50"
          >
            <Plus className="size-3" />
            Record metrics
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => simulateMutation.mutate()}
            title="Adds a backend-generated test snapshot when no ad platform API is connected"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background disabled:opacity-50"
          >
            {simulateMutation.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <BarChart3 className="size-3" />
            )}
            Add test snapshot
          </button>
          <button
            type="button"
            disabled={isPending || !canAnalyze}
            onClick={() => analyzeMutation.mutate()}
            title={
              canAnalyze
                ? 'Run AI monitoring analysis on recorded snapshots'
                : 'Record at least one snapshot first'
            }
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border border-primary/25 bg-primary-soft px-2.5 py-1.5',
              'text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50',
            )}
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Sparkles className="size-3" />
            )}
            Run AI analysis
          </button>
        </div>
      </div>

      <MonitoringSnapshotTable snapshots={snapshots} isLoading={isLoading} />
      <MonitoringAnalysisPanel analysis={analysis} />

      <RecordMonitoringSnapshotDialog
        open={recordDialogOpen}
        leadId={leadId}
        packageId={packageId}
        onClose={() => setRecordDialogOpen(false)}
      />
    </div>
  )
}
