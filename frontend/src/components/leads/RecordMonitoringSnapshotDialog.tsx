import { Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useCreateMonitoringSnapshotMutation } from '@/hooks/useDeployment'
import { cn } from '@/lib/utils'
import type { MonitoringSnapshotCreateRequest } from '@/types/deployment'

interface RecordMonitoringSnapshotDialogProps {
  open: boolean
  leadId: string
  packageId: string
  onClose: () => void
}

const DEFAULT_FORM: MonitoringSnapshotCreateRequest = {
  impressions: 0,
  clicks: 0,
  spend: 0,
  conversions: 0,
  ctr: null,
  cpc: null,
}

export function RecordMonitoringSnapshotDialog({
  open,
  leadId,
  packageId,
  onClose,
}: RecordMonitoringSnapshotDialogProps) {
  const [form, setForm] = useState<MonitoringSnapshotCreateRequest>(DEFAULT_FORM)
  const createMutation = useCreateMonitoringSnapshotMutation(leadId, packageId)

  useEffect(() => {
    if (!open) {
      setForm(DEFAULT_FORM)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    await createMutation.mutateAsync(form)
    onClose()
  }

  function updateNumberField(
    field: keyof MonitoringSnapshotCreateRequest,
    value: string,
    allowNull = false,
  ) {
    if (allowNull && value.trim() === '') {
      setForm((prev) => ({ ...prev, [field]: null }))
      return
    }
    const parsed = Number(value)
    setForm((prev) => ({
      ...prev,
      [field]: Number.isFinite(parsed) ? parsed : 0,
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-snapshot-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-[var(--shadow-elevated)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="record-snapshot-title" className="text-base font-semibold text-foreground">
              Record campaign metrics
            </h2>
            <p className="mt-1 text-xs text-muted">
              Enter performance data from your ad platform for monitoring analysis.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-section-alt hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted">Impressions</span>
              <input
                type="number"
                min={0}
                value={form.impressions ?? 0}
                onChange={(event) => updateNumberField('impressions', event.target.value)}
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted">Clicks</span>
              <input
                type="number"
                min={0}
                value={form.clicks ?? 0}
                onChange={(event) => updateNumberField('clicks', event.target.value)}
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted">Spend ($)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.spend ?? 0}
                onChange={(event) => updateNumberField('spend', event.target.value)}
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted">Conversions</span>
              <input
                type="number"
                min={0}
                value={form.conversions ?? 0}
                onChange={(event) => updateNumberField('conversions', event.target.value)}
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted">CTR (%)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.ctr ?? ''}
                onChange={(event) => updateNumberField('ctr', event.target.value, true)}
                placeholder="Optional"
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
                  'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-muted">CPC ($)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.cpc ?? ''}
                onChange={(event) => updateNumberField('cpc', event.target.value, true)}
                placeholder="Optional"
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
                  'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-section-alt"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary-soft px-3 py-2',
                'text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50',
              )}
            >
              {createMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Save snapshot
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
