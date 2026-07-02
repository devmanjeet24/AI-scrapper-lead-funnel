import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateScrapeJobMutation } from '@/hooks/useScrapeJobs'
import { SOURCE_TYPE_OPTIONS } from '@/lib/scrape'
import { cn } from '@/lib/utils'
import type { ScrapeSourceType } from '@/types/signal'

const createScrapeJobSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters'),
  description: z.string().max(5000, 'Description is too long').optional(),
  source_type: z.enum(['web', 'social', 'competitor', 'review', 'other']),
  target_url: z
    .string()
    .min(1, 'Target URL is required')
    .url('Enter a valid URL'),
})

type CreateScrapeJobFormValues = z.infer<typeof createScrapeJobSchema>

interface CreateScrapeJobDialogProps {
  open: boolean
  onClose: () => void
  onCreated?: (jobId: string) => void
}

export function CreateScrapeJobDialog({
  open,
  onClose,
  onCreated,
}: CreateScrapeJobDialogProps) {
  const createMutation = useCreateScrapeJobMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateScrapeJobFormValues>({
    resolver: zodResolver(createScrapeJobSchema),
    defaultValues: {
      name: '',
      description: '',
      source_type: 'web',
      target_url: '',
    },
  })

  if (!open) return null

  const onSubmit = handleSubmit(async (values) => {
    const job = await createMutation.mutateAsync({
      name: values.name.trim(),
      description: values.description?.trim() || null,
      source_type: values.source_type as ScrapeSourceType,
      target_url: values.target_url.trim(),
    })
    reset()
    onCreated?.(job.id)
    onClose()
  })

  const handleClose = () => {
    if (createMutation.isPending) return
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
        aria-labelledby="create-scrape-job-title"
        className={cn(
          'relative w-full max-w-lg rounded-[var(--radius-card)] border border-border/70 bg-surface-solid p-6',
          'shadow-[var(--shadow-float)]',
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="create-scrape-job-title" className="text-lg font-semibold text-foreground">
              Create Scrape Job
            </h2>
            <p className="mt-1 text-sm text-muted">
              Monitor a target URL and automatically extract signals.
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
            <label htmlFor="job-name" className="text-sm font-medium text-foreground">
              Job name <span className="text-red-600">*</span>
            </label>
            <input
              id="job-name"
              {...register('name')}
              placeholder="Acme Corp careers page"
              className={cn(
                'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
              )}
            />
            {errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="job-source-type" className="text-sm font-medium text-foreground">
                Source type <span className="text-red-600">*</span>
              </label>
              <select
                id="job-source-type"
                {...register('source_type')}
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              >
                {SOURCE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label htmlFor="job-target-url" className="text-sm font-medium text-foreground">
                Target URL <span className="text-red-600">*</span>
              </label>
              <input
                id="job-target-url"
                {...register('target_url')}
                placeholder="https://example.com"
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
              {errors.target_url ? (
                <p className="text-xs text-red-600">{errors.target_url.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="job-description" className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="job-description"
              rows={3}
              {...register('description')}
              placeholder="What should this job monitor?"
              className={cn(
                'w-full resize-none rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="rounded-[var(--radius-button)] px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-2.5',
                'text-sm font-semibold text-white shadow-[var(--shadow-button)] disabled:opacity-60',
              )}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
