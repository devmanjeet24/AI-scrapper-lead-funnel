import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateLeadMutation } from '@/hooks/useLeads'
import { LEAD_PRIORITY_OPTIONS } from '@/lib/leads'
import { cn } from '@/lib/utils'
import type { SignalPriority } from '@/types/lead'

const createLeadSchema = z.object({
  title: z
    .string()
    .min(1, 'Company name is required')
    .max(500, 'Company name must be at most 500 characters'),
  summary: z.string().max(5000, 'Summary is too long').optional(),
  source_label: z.string().max(255, 'Source label is too long').optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  lead_score: z
    .string()
    .optional()
    .refine((value) => !value || /^[0-9]+$/.test(value), 'Lead score must be a whole number')
    .refine((value) => !value || (Number(value) >= 0 && Number(value) <= 100), {
      message: 'Lead score must be between 0 and 100',
    }),
})

type CreateLeadFormValues = z.infer<typeof createLeadSchema>

interface CreateLeadDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateLeadDialog({ open, onClose }: CreateLeadDialogProps) {
  const createLeadMutation = useCreateLeadMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLeadFormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      title: '',
      summary: '',
      source_label: '',
      priority: undefined,
      lead_score: '',
    },
  })

  if (!open) return null

  const onSubmit = handleSubmit(async (values) => {
    const leadScore = values.lead_score?.trim()
    await createLeadMutation.mutateAsync({
      title: values.title.trim(),
      summary: values.summary?.trim() || null,
      source_label: values.source_label?.trim() || null,
      priority: (values.priority as SignalPriority | undefined) ?? null,
      lead_score: leadScore ? Number(leadScore) : null,
    })
    reset()
    onClose()
  })

  const handleClose = () => {
    if (createLeadMutation.isPending) return
    reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-lead-title"
        className={cn(
          'relative w-full max-w-lg rounded-[var(--radius-card)] border border-border/70 bg-surface-solid p-6',
          'shadow-[var(--shadow-float)]',
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="create-lead-title" className="text-lg font-semibold text-foreground">
              Create Lead
            </h2>
            <p className="mt-1 text-sm text-muted">Add a new lead to your pipeline.</p>
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
            <label htmlFor="lead-title" className="text-sm font-medium text-foreground">
              Company <span className="text-red-600">*</span>
            </label>
            <input
              id="lead-title"
              {...register('title')}
              placeholder="Acme Corp"
              className={cn(
                'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
              )}
            />
            {errors.title ? (
              <p className="text-xs text-red-600">{errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="lead-summary" className="text-sm font-medium text-foreground">
              Summary
            </label>
            <textarea
              id="lead-summary"
              rows={3}
              {...register('summary')}
              placeholder="Brief description of the opportunity"
              className={cn(
                'w-full resize-none rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
              )}
            />
            {errors.summary ? (
              <p className="text-xs text-red-600">{errors.summary.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="lead-source" className="text-sm font-medium text-foreground">
                Source Signal
              </label>
              <input
                id="lead-source"
                {...register('source_label')}
                placeholder="e.g. Series B funding"
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lead-priority" className="text-sm font-medium text-foreground">
                Priority
              </label>
              <select
                id="lead-priority"
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

          <div className="space-y-1.5">
            <label htmlFor="lead-score" className="text-sm font-medium text-foreground">
              Lead Score
            </label>
            <input
              id="lead-score"
              type="text"
              inputMode="numeric"
              {...register('lead_score')}
              placeholder="0–100"
              className={cn(
                'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
              )}
            />
            {errors.lead_score ? (
              <p className="text-xs text-red-600">{errors.lead_score.message}</p>
            ) : null}
          </div>

          {createLeadMutation.isError ? (
            <p className="text-sm text-red-600">
              {createLeadMutation.error instanceof Error
                ? createLeadMutation.error.message
                : 'Failed to create lead. Please try again.'}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={createLeadMutation.isPending}
              className="rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLeadMutation.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-2.5',
                'text-sm font-semibold text-white shadow-[0_8px_24px_rgb(28_200_141/0.35)]',
                'transition-shadow hover:shadow-[0_12px_32px_rgb(28_200_141/0.45)] disabled:opacity-60',
              )}
            >
              {createLeadMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Lead'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
