import { isAxiosError } from 'axios'
import { Loader2, Users, X } from 'lucide-react'

import { LeadPriorityBadge } from '@/components/leads/LeadPriorityBadge'
import { useConvertSignalMutation } from '@/hooks/useSignals'
import { getSignalLeadScore } from '@/lib/signals'
import { cn } from '@/lib/utils'
import type { Signal } from '@/types/signal'

interface ConvertSignalDialogProps {
  open: boolean
  signal: Signal | null
  onClose: () => void
  onConverted?: (leadId: string) => void
}

export function ConvertSignalDialog({
  open,
  signal,
  onClose,
  onConverted,
}: ConvertSignalDialogProps) {
  const convertMutation = useConvertSignalMutation()

  if (!open || !signal) return null

  const leadScore = getSignalLeadScore(signal)

  const handleConvert = async () => {
    try {
      const lead = await convertMutation.mutateAsync(signal.id)
      onConverted?.(lead.id)
      onClose()
    } catch (error) {
      if (!isAxiosError(error)) {
        // Toast handled in mutation onError
      }
    }
  }

  const handleClose = () => {
    if (convertMutation.isPending) return
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="convert-signal-title"
        className={cn(
          'relative w-full max-w-md rounded-[var(--radius-card)] border border-border/70 bg-surface-solid p-6',
          'shadow-[var(--shadow-float)]',
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="convert-signal-title" className="text-lg font-semibold text-foreground">
              Convert to lead
            </h2>
            <p className="mt-1 text-sm text-muted">
              Create a lead from this signal. Fields will be copied from the AI analysis.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-section-alt hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-6 space-y-3 rounded-xl border border-border/80 bg-section-alt/50 p-4">
          <p className="text-sm font-medium text-foreground">{signal.title}</p>
          {signal.summary ? <p className="text-sm text-muted">{signal.summary}</p> : null}
          <div className="flex flex-wrap items-center gap-3">
            {leadScore !== null ? (
              <span className="text-sm text-muted">
                Score:{' '}
                <span className="font-semibold text-foreground tabular-nums">{leadScore}</span>
              </span>
            ) : null}
            <LeadPriorityBadge priority={signal.priority} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={convertMutation.isPending}
            className="rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConvert}
            disabled={convertMutation.isPending}
            className={cn(
              'inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-2.5',
              'text-sm font-semibold text-white shadow-[var(--shadow-button)]',
              'transition-shadow hover:shadow-[var(--shadow-button-hover)] disabled:opacity-60',
            )}
          >
            {convertMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Converting…
              </>
            ) : (
              <>
                <Users className="size-4" />
                Convert to Lead
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
