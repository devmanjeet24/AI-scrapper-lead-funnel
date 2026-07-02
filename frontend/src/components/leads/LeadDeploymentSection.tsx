import { format } from 'date-fns'
import { Loader2, Package, Play, Search } from 'lucide-react'

import { DeploymentMonitoringSection } from '@/components/leads/DeploymentMonitoringSection'
import { DeploymentStatusBadge } from '@/components/leads/DeploymentStatusBadge'
import {
  useAnalyzeDeploymentMutation,
  useCreateDeploymentPackageMutation,
  useDeploymentPackagesQuery,
  useExecuteDeploymentMutation,
} from '@/hooks/useDeployment'
import { useCreativeAssetsQuery, useCreativeSetsQuery } from '@/hooks/useCreatives'
import { canCreateDeployment } from '@/lib/creatives'
import { cn } from '@/lib/utils'

interface LeadDeploymentSectionProps {
  leadId: string
}

function getAnalysisSummary(agentMetadata: Record<string, unknown>): string | null {
  const plan = agentMetadata.deployment_plan ?? agentMetadata.plan
  if (plan && typeof plan === 'object' && 'summary' in plan) {
    const summary = (plan as { summary: unknown }).summary
    if (typeof summary === 'string' && summary.trim()) return summary.trim()
  }
  if (typeof agentMetadata.analysis_summary === 'string') {
    return agentMetadata.analysis_summary
  }
  return null
}

export function LeadDeploymentSection({ leadId }: LeadDeploymentSectionProps) {
  const { data: packagesData, isLoading } = useDeploymentPackagesQuery(leadId)
  const { data: setsData } = useCreativeSetsQuery(leadId)
  const { data: assetsData } = useCreativeAssetsQuery(leadId)
  const createMutation = useCreateDeploymentPackageMutation(leadId)
  const analyzeMutation = useAnalyzeDeploymentMutation(leadId)
  const executeMutation = useExecuteDeploymentMutation(leadId)

  const packages = packagesData?.items ?? []
  const latestSet = setsData?.items?.[0]
  const assets = assetsData?.items ?? []
  const canCreate = latestSet && canCreateDeployment(assets)
  const isPending =
    createMutation.isPending || analyzeMutation.isPending || executeMutation.isPending

  async function handleCreatePackage() {
    if (!latestSet) return
    await createMutation.mutateAsync({ creativeSetId: latestSet.id })
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          <Package className="size-3.5 text-primary" />
          Deployment
        </h3>
        <button
          type="button"
          disabled={!canCreate || isPending}
          onClick={handleCreatePackage}
          title={
            canCreate
              ? 'Create deployment package from approved creatives'
              : 'Approve at least 1 headline and 1 ad copy first'
          }
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5',
            'text-xs font-semibold text-foreground transition-colors hover:bg-section-alt disabled:opacity-50',
          )}
        >
          {createMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Package className="size-3.5" />
          )}
          Create package
        </button>
      </div>

      {isLoading ? (
        <div className="h-20 animate-pulse rounded-xl bg-foreground/5" />
      ) : null}

      {!isLoading && packages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/80 px-4 py-6 text-center text-sm text-muted">
          No deployment packages yet. Approve creatives, then create a package to deploy.
        </p>
      ) : null}

      {!isLoading && packages.length > 0 ? (
        <div className="space-y-3">
          {packages.map((pkg) => {
            const analysisSummary = getAnalysisSummary(pkg.agent_metadata)
            const deployMessage =
              pkg.deploy_result && typeof pkg.deploy_result.message === 'string'
                ? pkg.deploy_result.message
                : null

            return (
              <div
                key={pkg.id}
                className="rounded-xl border border-border/80 bg-section-alt/40 p-3"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <DeploymentStatusBadge status={pkg.status} />
                  {pkg.channel_hint ? (
                    <span className="text-[10px] text-muted">{pkg.channel_hint}</span>
                  ) : null}
                  <span className="ml-auto text-[10px] text-muted">
                    {format(new Date(pkg.created_at), 'MMM d, yyyy')}
                  </span>
                </div>

                {analysisSummary ? (
                  <p className="mb-2 text-xs leading-relaxed text-foreground">{analysisSummary}</p>
                ) : null}

                {deployMessage ? (
                  <p className="mb-2 text-xs text-emerald-700">{deployMessage}</p>
                ) : null}

                {pkg.error_message ? (
                  <p className="mb-2 text-xs text-red-600">{pkg.error_message}</p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => analyzeMutation.mutate({ packageId: pkg.id, payload: { mode: 'export' } })}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background disabled:opacity-50"
                  >
                    {analyzeMutation.isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Search className="size-3" />
                    )}
                    Analyze
                  </button>
                  <button
                    type="button"
                    disabled={isPending || pkg.status === 'deployed'}
                    onClick={() => executeMutation.mutate({ packageId: pkg.id, payload: { mode: 'export' } })}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/25 bg-primary-soft px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                  >
                    {executeMutation.isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Play className="size-3" />
                    )}
                    Execute
                  </button>
                </div>

                {pkg.status === 'deployed' ? (
                  <DeploymentMonitoringSection
                    leadId={leadId}
                    packageId={pkg.id}
                    agentMetadata={pkg.agent_metadata}
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
