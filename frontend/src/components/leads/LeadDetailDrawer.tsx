import { format, formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Archive,
  ExternalLink,
  Pencil,
  Radio,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { ArchiveLeadDialog } from '@/components/leads/ArchiveLeadDialog'
import { EditLeadDialog } from '@/components/leads/EditLeadDialog'
import { LeadCreativesSection } from '@/components/leads/LeadCreativesSection'
import { LeadDeploymentSection } from '@/components/leads/LeadDeploymentSection'
import { LeadPriorityBadge } from '@/components/leads/LeadPriorityBadge'
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge'
import { useLeadQuery, useUpdateLeadMutation } from '@/hooks/useLeads'
import { getLeadCompany, getLeadSourceSignal } from '@/lib/leads'
import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/types/lead'

const ease = [0.22, 1, 0.36, 1] as const

const STATUS_ACTIONS: { status: LeadStatus; label: string }[] = [
  { status: 'contacted', label: 'Mark contacted' },
  { status: 'won', label: 'Mark won' },
  { status: 'lost', label: 'Mark lost' },
]

interface LeadDetailDrawerProps {
  leadId: string | null
  onClose: () => void
  onArchived?: () => void
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/80 bg-section-alt/50 px-3 py-2.5 text-center">
      <p className="text-[10px] font-medium text-muted">{label}</p>
      <p className="mt-0.5 text-base font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-foreground/5" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-foreground/5" />
      </div>
      <div className="h-8 w-3/4 animate-pulse rounded bg-foreground/5" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-foreground/5" />
        ))}
      </div>
      <div className="h-32 animate-pulse rounded-xl bg-foreground/5" />
    </div>
  )
}

export function LeadDetailDrawer({ leadId, onClose, onArchived }: LeadDetailDrawerProps) {
  const { data: lead, isLoading, isError } = useLeadQuery(leadId)
  const updateMutation = useUpdateLeadMutation()
  const [editOpen, setEditOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  useEffect(() => {
    if (!leadId) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [leadId, onClose])

  async function handleStatusUpdate(status: LeadStatus, label: string) {
    if (!leadId) return
    await updateMutation.mutateAsync({ leadId, payload: { status } })
    toast.success(label)
  }

  const isActionPending = updateMutation.isPending
  const sourceSignal = lead ? getLeadSourceSignal(lead) : null

  return (
    <>
      <AnimatePresence>
        {leadId ? (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              aria-label="Close drawer"
              onClick={onClose}
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="lead-drawer-title"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease }}
              className={cn(
                'relative flex h-full w-full max-w-xl flex-col border-l border-border/70 bg-surface-solid',
                'shadow-[var(--shadow-float)]',
              )}
            >
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                <p className="text-sm font-semibold text-foreground">Lead workspace</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted transition-colors hover:bg-section-alt hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? <DrawerSkeleton /> : null}

                {isError ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-muted">Unable to load lead details.</p>
                  </div>
                ) : null}

                {lead ? (
                  <div className="space-y-6 p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <LeadStatusBadge status={lead.status} />
                      <LeadPriorityBadge priority={lead.priority} />
                    </div>

                    <div>
                      <h2
                        id="lead-drawer-title"
                        className="text-xl font-semibold tracking-tight text-foreground"
                      >
                        {getLeadCompany(lead)}
                      </h2>
                      <p className="mt-1.5 text-sm text-muted">
                        Created{' '}
                        <time dateTime={lead.created_at}>
                          {format(new Date(lead.created_at), 'MMM d, yyyy')}
                        </time>
                        {' · '}
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                      </p>
                      {lead.status_updated_at ? (
                        <p className="mt-0.5 text-xs text-muted">
                          Status updated {format(new Date(lead.status_updated_at), 'MMM d, yyyy')}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <MetricTile
                        label="Lead score"
                        value={lead.lead_score?.toString() ?? '—'}
                      />
                      <MetricTile
                        label="Confidence"
                        value={
                          lead.confidence_score !== null
                            ? `${Math.round(lead.confidence_score * 100)}%`
                            : '—'
                        }
                      />
                      <MetricTile
                        label="Priority"
                        value={
                          lead.priority
                            ? lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)
                            : '—'
                        }
                      />
                    </div>

                    {lead.summary ? (
                      <section className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Summary
                        </h3>
                        <p className="text-sm leading-relaxed text-foreground">{lead.summary}</p>
                      </section>
                    ) : null}

                    {lead.recommendation ? (
                      <section className="space-y-2">
                        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                          <Sparkles className="size-3.5 text-primary" />
                          AI recommendation
                        </h3>
                        <div className="rounded-xl border border-primary/20 bg-primary-soft/40 px-4 py-3 text-sm leading-relaxed text-foreground">
                          {lead.recommendation}
                        </div>
                      </section>
                    ) : null}

                    {lead.notes ? (
                      <section className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                          Notes
                        </h3>
                        <p className="text-sm leading-relaxed text-foreground">{lead.notes}</p>
                      </section>
                    ) : null}

                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Source
                      </h3>
                      <div className="space-y-1">
                        {sourceSignal ? (
                          <p className="text-sm font-medium text-foreground">{sourceSignal}</p>
                        ) : null}
                        {lead.signal_id ? (
                          <Link
                            to={`/signals`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 hover:underline"
                          >
                            <Radio className="size-3" />
                            View originating signal
                          </Link>
                        ) : null}
                        {lead.source_url ? (
                          <a
                            href={lead.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            {lead.source_url}
                            <ExternalLink className="size-3.5 shrink-0" />
                          </a>
                        ) : (
                          <p className="text-sm text-muted">No source URL</p>
                        )}
                      </div>
                    </section>

                    <div className="border-t border-border/60 pt-6">
                      <LeadCreativesSection leadId={lead.id} />
                    </div>

                    <div className="border-t border-border/60 pt-6">
                      <LeadDeploymentSection leadId={lead.id} />
                    </div>
                  </div>
                ) : null}
              </div>

              {lead && lead.status !== 'archived' ? (
                <div className="border-t border-border/60 bg-surface-solid p-4">
                  <Link
                    to={`/outreach?lead_id=${lead.id}&create=1`}
                    className={cn(
                      'mb-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)]',
                      'border border-primary/25 bg-primary-soft px-5 py-2.5 text-sm font-semibold text-primary',
                      'transition-colors hover:bg-primary/10',
                    )}
                  >
                    <Send className="size-4" />
                    Start outreach
                  </Link>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {STATUS_ACTIONS.filter((action) => action.status !== lead.status).map(
                      (action) => (
                        <button
                          key={action.status}
                          type="button"
                          disabled={isActionPending}
                          onClick={() => handleStatusUpdate(action.status, action.label)}
                          className="rounded-xl border border-border/80 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-section-alt disabled:opacity-50"
                        >
                          {action.label}
                        </button>
                      ),
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isActionPending}
                      onClick={() => setEditOpen(true)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-section-alt disabled:opacity-50"
                    >
                      <Pencil className="size-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={isActionPending}
                      onClick={() => setArchiveOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-section-alt hover:text-foreground disabled:opacity-50"
                    >
                      <Archive className="size-4" />
                      Archive
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      <EditLeadDialog open={editOpen} lead={lead ?? null} onClose={() => setEditOpen(false)} />

      <ArchiveLeadDialog
        open={archiveOpen}
        lead={lead ?? null}
        onClose={() => setArchiveOpen(false)}
        onArchived={() => {
          onArchived?.()
          onClose()
        }}
      />
    </>
  )
}
