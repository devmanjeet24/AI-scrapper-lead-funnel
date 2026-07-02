import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import { useUpdateSignalMutation } from '@/hooks/useSignals'
import { cn } from '@/lib/utils'

const dismissSchema = z.object({
  dismissed_reason: z
    .string()
    .min(1, 'A reason is required')
    .max(500, 'Reason must be at most 500 characters'),
})

type DismissFormValues = z.infer<typeof dismissSchema>

interface DismissSignalDialogProps {
  open: boolean
  signalId: string | null
  signalTitle?: string
  onClose: () => void
  onDismissed?: () => void
}

export function DismissSignalDialog({
  open,
  signalId,
  signalTitle,
  onClose,
  onDismissed,
}: DismissSignalDialogProps) {
  const updateMutation = useUpdateSignalMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DismissFormValues>({
    resolver: zodResolver(dismissSchema),
    defaultValues: { dismissed_reason: '' },
  })

  if (!open || !signalId) return null

  const onSubmit = handleSubmit(async (values) => {
    await updateMutation.mutateAsync({
      signalId,
      payload: {
        status: 'dismissed',
        dismissed_reason: values.dismissed_reason.trim(),
      },
    })
    toast.success('Signal dismissed')
    reset()
    onDismissed?.()
    onClose()
  })

  const handleClose = () => {
    if (updateMutation.isPending) return
    reset()
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
        aria-labelledby="dismiss-signal-title"
        className={cn(
          'relative w-full max-w-md rounded-[var(--radius-card)] border border-border/70 bg-surface-solid p-6',
          'shadow-[var(--shadow-float)]',
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="dismiss-signal-title" className="text-lg font-semibold text-foreground">
              Dismiss signal
            </h2>
            <p className="mt-1 text-sm text-muted">
              {signalTitle
                ? `Why are you dismissing "${signalTitle}"?`
                : 'Provide a reason for dismissing this signal.'}
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="dismiss-reason" className="text-sm font-medium text-foreground">
              Reason <span className="text-red-600">*</span>
            </label>
            <textarea
              id="dismiss-reason"
              rows={3}
              {...register('dismissed_reason')}
              placeholder="Not relevant to our ICP, duplicate, low quality…"
              className={cn(
                'w-full resize-none rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
              )}
            />
            {errors.dismissed_reason ? (
              <p className="text-xs text-red-600">{errors.dismissed_reason.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={updateMutation.isPending}
              className="rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-border px-5 py-2.5',
                'text-sm font-semibold text-foreground transition-colors hover:bg-section-alt disabled:opacity-60',
              )}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Dismissing…
                </>
              ) : (
                'Dismiss signal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
