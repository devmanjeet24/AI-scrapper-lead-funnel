import { Loader2, X } from 'lucide-react'

import { useArchiveLeadMutation } from '@/hooks/useLeads'
import { getLeadCompany } from '@/lib/leads'
import { cn } from '@/lib/utils'
import type { Lead } from '@/types/lead'

interface ArchiveLeadDialogProps {
  open: boolean
  lead: Lead | null
  onClose: () => void
  onArchived?: () => void
}

export function ArchiveLeadDialog({ open, lead, onClose, onArchived }: ArchiveLeadDialogProps) {
  const archiveMutation = useArchiveLeadMutation()

  if (!open || !lead) return null

  async function handleArchive() {
    await archiveMutation.mutateAsync(lead!.id)
    onArchived?.()
    onClose()
  }

  const handleClose = () => {
    if (archiveMutation.isPending) return
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
        aria-labelledby="archive-lead-title"
        className={cn(
          'relative w-full max-w-md rounded-[var(--radius-card)] border border-border/70 bg-surface-solid p-6',
          'shadow-[var(--shadow-float)]',
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="archive-lead-title" className="text-lg font-semibold text-foreground">
              Archive lead
            </h2>
            <p className="mt-1 text-sm text-muted">
              Archive &ldquo;{getLeadCompany(lead)}&rdquo;? This removes it from your active pipeline.
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

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={archiveMutation.isPending}
            className="rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
            className={cn(
              'inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-red-200 bg-red-50 px-5 py-2.5',
              'text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60',
            )}
          >
            {archiveMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Archiving…
              </>
            ) : (
              'Archive lead'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
