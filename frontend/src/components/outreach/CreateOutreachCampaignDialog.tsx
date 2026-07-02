import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { listDeploymentPackages } from '@/api/deployment'
import { useCreateOutreachCampaignMutation } from '@/hooks/useOutreach'
import { useLeadsQuery } from '@/hooks/useLeads'
import { OUTREACH_CHANNEL_OPTIONS, SEARCH_FETCH_LIMIT } from '@/lib/outreach'
import { cn } from '@/lib/utils'
import type { OutreachChannel } from '@/types/outreach'

const createCampaignSchema = z
  .object({
    lead_id: z.string().min(1, 'Lead is required'),
    deployment_package_id: z.string().optional(),
    channel: z.enum(['internal', 'email', 'sms', 'voice']),
    subject: z.string().max(500).optional(),
    recipient_email: z.string().email('Enter a valid email').optional().or(z.literal('')),
    recipient_phone: z.string().max(50).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.channel === 'email' && !values.recipient_email?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email is required for email outreach',
        path: ['recipient_email'],
      })
    }
    if (
      (values.channel === 'sms' || values.channel === 'voice') &&
      !values.recipient_phone?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone is required for SMS/voice outreach',
        path: ['recipient_phone'],
      })
    }
  })

type CreateCampaignFormValues = z.infer<typeof createCampaignSchema>

interface CreateOutreachCampaignDialogProps {
  open: boolean
  defaultLeadId?: string | null
  defaultDeploymentPackageId?: string | null
  onClose: () => void
  onCreated?: (campaignId: string) => void
}

export function CreateOutreachCampaignDialog({
  open,
  defaultLeadId,
  defaultDeploymentPackageId,
  onClose,
  onCreated,
}: CreateOutreachCampaignDialogProps) {
  const createMutation = useCreateOutreachCampaignMutation()
  const { data: leadsData } = useLeadsQuery({ limit: SEARCH_FETCH_LIMIT, offset: 0 })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCampaignFormValues>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      lead_id: defaultLeadId ?? '',
      deployment_package_id: defaultDeploymentPackageId ?? '',
      channel: 'internal',
      subject: '',
      recipient_email: '',
      recipient_phone: '',
    },
  })

  const selectedLeadId = watch('lead_id')
  const selectedChannel = watch('channel')

  const { data: packagesData, isLoading: packagesLoading } = useQuery({
    queryKey: ['deployment-packages', 'lead', selectedLeadId, 'deployed'],
    queryFn: () =>
      listDeploymentPackages({
        lead_id: selectedLeadId,
        status: 'deployed',
        limit: 50,
      }),
    enabled: Boolean(selectedLeadId) && open,
  })

  const deployedPackages = packagesData?.items ?? []
  const leads = leadsData?.items ?? []

  useEffect(() => {
    if (!open) return
    reset({
      lead_id: defaultLeadId ?? '',
      deployment_package_id: defaultDeploymentPackageId ?? '',
      channel: 'internal',
      subject: '',
      recipient_email: '',
      recipient_phone: '',
    })
  }, [open, defaultLeadId, defaultDeploymentPackageId, reset])

  useEffect(() => {
    if (!selectedLeadId) {
      setValue('deployment_package_id', '')
    }
  }, [selectedLeadId, setValue])

  const showEmail = selectedChannel === 'email'
  const showPhone = selectedChannel === 'sms' || selectedChannel === 'voice'

  const packageOptions = useMemo(
    () =>
      deployedPackages.map((pkg) => ({
        id: pkg.id,
        label: `Deployed package · ${new Date(pkg.deployed_at ?? pkg.created_at).toLocaleDateString()}`,
      })),
    [deployedPackages],
  )

  if (!open) return null

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      channel: values.channel as OutreachChannel,
      subject: values.subject?.trim() || null,
      recipient_email: values.recipient_email?.trim() || null,
      recipient_phone: values.recipient_phone?.trim() || null,
    }

    const deploymentPackageId = values.deployment_package_id?.trim() || undefined

    const campaign = await createMutation.mutateAsync({
      leadId: deploymentPackageId ? undefined : values.lead_id,
      deploymentPackageId,
      payload,
    })

    reset()
    onCreated?.(campaign.id)
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
        aria-labelledby="create-outreach-title"
        className={cn(
          'relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-card)] border border-border/70 bg-surface-solid p-6',
          'shadow-[var(--shadow-float)]',
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="create-outreach-title" className="text-lg font-semibold text-foreground">
              Start outreach campaign
            </h2>
            <p className="mt-1 text-sm text-muted">
              AI drafts the first message using lead and deployment context.
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
            <label htmlFor="outreach-lead" className="text-sm font-medium text-foreground">
              Lead <span className="text-red-600">*</span>
            </label>
            <select
              id="outreach-lead"
              {...register('lead_id')}
              disabled={Boolean(defaultDeploymentPackageId)}
              className={cn(
                'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:opacity-60',
              )}
            >
              <option value="">Select a lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.title}
                </option>
              ))}
            </select>
            {errors.lead_id ? (
              <p className="text-xs text-red-600">{errors.lead_id.message}</p>
            ) : null}
          </div>

          {selectedLeadId ? (
            <div className="space-y-1.5">
              <label htmlFor="outreach-package" className="text-sm font-medium text-foreground">
                Deployment package
              </label>
              <select
                id="outreach-package"
                {...register('deployment_package_id')}
                disabled={Boolean(defaultDeploymentPackageId) || packagesLoading}
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:opacity-60',
                )}
              >
                <option value="">Direct outreach (no deployment)</option>
                {packageOptions.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted">
                Optional. Deployed packages inject creative context into the AI draft.
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="outreach-channel" className="text-sm font-medium text-foreground">
                Channel
              </label>
              <select
                id="outreach-channel"
                {...register('channel')}
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              >
                {OUTREACH_CHANNEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="outreach-subject" className="text-sm font-medium text-foreground">
                Subject
              </label>
              <input
                id="outreach-subject"
                {...register('subject')}
                placeholder="Optional — AI can draft"
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
            </div>
          </div>

          {showEmail ? (
            <div className="space-y-1.5">
              <label htmlFor="outreach-email" className="text-sm font-medium text-foreground">
                Recipient email <span className="text-red-600">*</span>
              </label>
              <input
                id="outreach-email"
                type="email"
                {...register('recipient_email')}
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
              {errors.recipient_email ? (
                <p className="text-xs text-red-600">{errors.recipient_email.message}</p>
              ) : null}
            </div>
          ) : null}

          {showPhone ? (
            <div className="space-y-1.5">
              <label htmlFor="outreach-phone" className="text-sm font-medium text-foreground">
                Recipient phone <span className="text-red-600">*</span>
              </label>
              <input
                id="outreach-phone"
                {...register('recipient_phone')}
                className={cn(
                  'w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground',
                  'focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
                )}
              />
              {errors.recipient_phone ? (
                <p className="text-xs text-red-600">{errors.recipient_phone.message}</p>
              ) : null}
            </div>
          ) : null}

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
                  Starting…
                </>
              ) : (
                'Start campaign'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
