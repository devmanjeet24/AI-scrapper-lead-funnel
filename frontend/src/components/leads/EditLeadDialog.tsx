import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import { useUpdateLeadMutation } from '@/hooks/useLeads'
import { LEAD_PRIORITY_OPTIONS } from '@/lib/leads'
import { cn } from '@/lib/utils'
import type { Lead, SignalPriority } from '@/types/lead'

const editLeadSchema = z.object({
  title: z.string().min(1, 'Company name is required').max(500),
  summary: z.string().max(5000).optional(),
  source_label: z.string().max(255).optional(),
  source_url: z.string().max(2048).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  lead_score: z
    .string()
    .optional()
    .refine((value) => !value || /^[0-9]+$/.test(value), 'Lead score must be a whole number')
    .refine((value) => !value || (Number(value) >= 0 && Number(value) <= 100), {
      message: 'Lead score must be between 0 and 100',
    }),
  recommendation: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
})

type EditLeadFormValues = z.infer<typeof editLeadSchema>

interface EditLeadDialogProps {
  open: boolean
  lead: Lead | null
  onClose: () => void
}

export function EditLeadDialog({ open, lead, onClose }: EditLeadDialogProps) {
  const updateMutation = useUpdateLeadMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditLeadFormValues>({
    resolver: zodResolver(editLeadSchema),
    defaultValues: {
      title: '',
      summary: '',
      source_label: '',
      source_url: '',
      priority: undefined,
      lead_score: '',
      recommendation: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (!lead || !open) return
    reset({
      title: lead.title,
      summary: lead.summary ?? '',
      source_label: lead.source_label ?? '',
      source_url: lead.source_url ?? '',
      priority: lead.priority ?? undefined,
      lead_score: lead.lead_score?.toString() ?? '',
      recommendation: lead.recommendation ?? '',
      notes: lead.notes ?? '',
    })
  }, [lead, open, reset])

  if (!open || !lead) return null

  const onSubmit = handleSubmit(async (values) => {
    const leadScore = values.lead_score?.trim()
    await updateMutation.mutateAsync({
      leadId: lead.id,
      payload: {
        title: values.title.trim(),
        summary: values.summary?.trim() || null,
        source_label: values.source_label?.trim() || null,
        source_url: values.source_url?.trim() || null,
        priority: (values.priority as SignalPriority | undefined) ?? null,
        lead_score: leadScore ? Number(leadScore) : null,
        recommendation: values.recommendation?.trim() || null,
        notes: values.notes?.trim() || null,
      },
    })
    toast.success('Lead updated')
    onClose()
  })

  const handleClose = () => {
    if (updateMutation.isPending) return
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
        aria-labelledby="edit-lead-title"
        className={cn(
          'relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-card)] border border-border/70 bg-surface-solid p-6',
          'shadow-[var(--shadow-float)]',
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-lead-title" className="text-lg font-semibold text-foreground">
              Edit lead
            </h2>
            <p className="mt-1 text-sm text-muted">Update lead details and intelligence.</p>
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
            <label htmlFor="edit-lead-title-field" className="text-sm font-medium text-foreground">
              Company <span className="text-red-600">*</span>
            </label>
            <input
              id="edit-lead-title-field"
              {...register('title')}
              className={cn(
                'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
              )}
            />
            {errors.title ? <p className="text-xs text-red-600">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-lead-summary" className="text-sm font-medium text-foreground">
              Summary
            </label>
            <textarea
              id="edit-lead-summary"
              rows={3}
              {...register('summary')}
              className={cn(
                'w-full resize-none rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="edit-lead-source" className="text-sm font-medium text-foreground">
                Source signal
              </label>
              <input
                id="edit-lead-source"
                {...register('source_label')}
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-lead-priority" className="text-sm font-medium text-foreground">
                Priority
              </label>
              <select
                id="edit-lead-priority"
                {...register('priority')}
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              >
                <option value="">None</option>
                {LEAD_PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="edit-lead-score" className="text-sm font-medium text-foreground">
                Lead score
              </label>
              <input
                id="edit-lead-score"
                {...register('lead_score')}
                placeholder="0–100"
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
              {errors.lead_score ? (
                <p className="text-xs text-red-600">{errors.lead_score.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="edit-lead-url" className="text-sm font-medium text-foreground">
                Source URL
              </label>
              <input
                id="edit-lead-url"
                {...register('source_url')}
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-lead-recommendation" className="text-sm font-medium text-foreground">
              AI recommendation
            </label>
            <textarea
              id="edit-lead-recommendation"
              rows={2}
              {...register('recommendation')}
              className={cn(
                'w-full resize-none rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="edit-lead-notes" className="text-sm font-medium text-foreground">
              Notes
            </label>
            <textarea
              id="edit-lead-notes"
              rows={2}
              {...register('notes')}
              className={cn(
                'w-full resize-none rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
              )}
            />
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
                'inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-2.5',
                'text-sm font-semibold text-white shadow-[var(--shadow-button)] disabled:opacity-60',
              )}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
