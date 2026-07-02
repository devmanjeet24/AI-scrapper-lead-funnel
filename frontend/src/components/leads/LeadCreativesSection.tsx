import { Loader2, Palette, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

import { CreativeAssetCard } from '@/components/leads/CreativeAssetCard'
import {
  useCreativeAssetsQuery,
  useCreativeSetsQuery,
  useGenerateCreativesMutation,
  useUpdateCreativeAssetMutation,
} from '@/hooks/useCreatives'
import { canCreateDeployment } from '@/lib/creatives'
import { cn } from '@/lib/utils'

interface LeadCreativesSectionProps {
  leadId: string
}

export function LeadCreativesSection({ leadId }: LeadCreativesSectionProps) {
  const { data: setsData, isLoading: setsLoading } = useCreativeSetsQuery(leadId)
  const { data: assetsData, isLoading: assetsLoading } = useCreativeAssetsQuery(leadId)
  const generateMutation = useGenerateCreativesMutation(leadId)
  const updateAssetMutation = useUpdateCreativeAssetMutation(leadId)

  const creativeSets = setsData?.items ?? []
  const assets = assetsData?.items ?? []
  const latestSet = creativeSets[0]
  const isLoading = setsLoading || assetsLoading
  const isPending = generateMutation.isPending || updateAssetMutation.isPending

  async function handleApprove(assetId: string) {
    await updateAssetMutation.mutateAsync({
      assetId,
      payload: { status: 'approved' },
    })
    toast.success('Asset approved')
  }

  async function handleReject(assetId: string, reason?: string) {
    await updateAssetMutation.mutateAsync({
      assetId,
      payload: { status: 'rejected', rejection_reason: reason ?? null },
    })
    toast.success('Asset rejected')
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          <Palette className="size-3.5 text-primary" />
          Creatives
        </h3>
        <button
          type="button"
          disabled={generateMutation.isPending}
          onClick={() => generateMutation.mutate({})}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary-soft px-3 py-1.5',
            'text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60',
          )}
        >
          {generateMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          Generate
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-16 animate-pulse rounded-xl bg-foreground/5" />
          <div className="h-16 animate-pulse rounded-xl bg-foreground/5" />
        </div>
      ) : null}

      {!isLoading && creativeSets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/80 px-4 py-6 text-center text-sm text-muted">
          No creative sets yet. Generate AI copy tailored to this lead.
        </p>
      ) : null}

      {!isLoading && latestSet ? (
        <div className="rounded-xl border border-border/80 bg-background/50 p-3">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              {latestSet.campaign_name ?? 'Creative set'}
            </p>
            <span className="rounded-full border border-border bg-section-alt px-2 py-0.5 text-[10px] font-medium capitalize text-muted">
              {latestSet.status}
            </span>
          </div>
          {latestSet.campaign_objective ? (
            <p className="mb-2 text-xs text-muted">{latestSet.campaign_objective}</p>
          ) : null}
          <p className="text-[10px] text-muted">
            Created {format(new Date(latestSet.created_at), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
      ) : null}

      {!isLoading && assets.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted">
            {assets.length} asset{assets.length === 1 ? '' : 's'}
            {canCreateDeployment(assets) ? ' · Ready for deployment' : ' · Approve 1 headline + 1 ad copy to deploy'}
          </p>
          {assets.map((asset) => (
            <CreativeAssetCard
              key={asset.id}
              asset={asset}
              isPending={isPending}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && creativeSets.length > 1 ? (
        <p className="text-[10px] text-muted">
          Showing assets from all {creativeSets.length} creative sets.
        </p>
      ) : null}
    </section>
  )
}
