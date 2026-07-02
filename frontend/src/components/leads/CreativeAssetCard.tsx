import { Check, Loader2, X } from 'lucide-react'
import { useState } from 'react'

import { CreativeAssetStatusBadge } from '@/components/leads/CreativeAssetStatusBadge'
import { CREATIVE_ASSET_TYPE_LABELS, getCreativeAssetDisplayText } from '@/lib/creatives'
import { cn } from '@/lib/utils'
import type { CreativeAsset } from '@/types/creative'

interface CreativeAssetCardProps {
  asset: CreativeAsset
  isPending: boolean
  onApprove: (assetId: string) => void
  onReject: (assetId: string, reason?: string) => void
}

export function CreativeAssetCard({
  asset,
  isPending,
  onApprove,
  onReject,
}: CreativeAssetCardProps) {
  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const canReview = asset.status === 'draft'

  return (
    <div className="rounded-xl border border-border/80 bg-section-alt/40 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            {CREATIVE_ASSET_TYPE_LABELS[asset.asset_type]}
          </p>
          {asset.title ? (
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">{asset.title}</p>
          ) : null}
        </div>
        <CreativeAssetStatusBadge status={asset.status} />
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {getCreativeAssetDisplayText(asset)}
      </p>

      {asset.status === 'rejected' && asset.rejection_reason ? (
        <p className="mt-2 text-xs text-red-600">Reason: {asset.rejection_reason}</p>
      ) : null}

      {canReview ? (
        <div className="mt-3 space-y-2">
          {showReject ? (
            <div className="space-y-2">
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Optional rejection reason"
                className={cn(
                  'w-full resize-none rounded-lg border border-border/80 bg-background px-3 py-2 text-xs text-foreground',
                  'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    onReject(asset.id, rejectReason.trim() || undefined)
                    setShowReject(false)
                    setRejectReason('')
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-700 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
                  Confirm reject
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowReject(false)}
                  className="rounded-lg px-2 py-1.5 text-xs text-muted hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => onApprove(asset.id)}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                Approve
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowReject(true)}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-section-alt hover:text-foreground disabled:opacity-50"
              >
                <X className="size-3" />
                Reject
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
