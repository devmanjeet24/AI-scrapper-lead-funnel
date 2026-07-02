import { format, formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ExternalLink,
  Loader2,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { LeadPriorityBadge } from '@/components/leads/LeadPriorityBadge'
import { SignalStatusBadge } from '@/components/signals/SignalStatusBadge'
import { SignalTypeBadge } from '@/components/signals/SignalTypeBadge'
import { useSignalQuery, useUpdateSignalMutation } from '@/hooks/useSignals'
import {
  canConvertSignal,
  formatConfidenceScore,
  getSignalDetectedAt,
  getSignalLeadScore,
  getSignalRecommendation,
} from '@/lib/signals'
import { cn } from '@/lib/utils'
import type { Signal } from '@/types/signal'

const ease = [0.22, 1, 0.36, 1] as const

interface SignalDetailDrawerProps {
  signalId: string | null
  onClose: () => void
  onDismiss: (signal: Signal) => void
  onConvert: (signal: Signal) => void
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/80 bg-section-alt/50 px-4 py-3 text-center">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</p>
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
          <div key={i} className="h-16 animate-pulse rounded-xl bg-foreground/5" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-foreground/5" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-foreground/5" />
      </div>
    </div>
  )
}

export function SignalDetailDrawer({
  signalId,
  onClose,
  onDismiss,
  onConvert,
}: SignalDetailDrawerProps) {
  const { data: signal, isLoading, isError } = useSignalQuery(signalId)
  const updateMutation = useUpdateSignalMutation()

  useEffect(() => {
    if (!signalId) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [signalId, onClose])

  async function handleStatusUpdate(
    payload: Parameters<typeof updateMutation.mutateAsync>[0]['payload'],
    successMessage: string,
  ) {
    if (!signalId) return
    await updateMutation.mutateAsync({ signalId, payload })
    toast.success(successMessage)
  }

  const isActionPending = updateMutation.isPending

  return (
    <AnimatePresence>
      {signalId ? (
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
            aria-labelledby="signal-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease }}
            className={cn(
              'relative flex h-full w-full max-w-md flex-col border-l border-border/70 bg-surface-solid',
              'shadow-[var(--shadow-float)]',
            )}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <p className="text-sm font-semibold text-foreground">Signal details</p>
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
                  <p className="text-sm text-muted">Unable to load signal details.</p>
                </div>
              ) : null}

              {signal ? (
                <div className="space-y-6 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <SignalTypeBadge signalType={signal.signal_type} />
                    <SignalStatusBadge status={signal.status} />
                    <LeadPriorityBadge priority={signal.priority} />
                  </div>

                  <div>
                    <h2
                      id="signal-drawer-title"
                      className="text-xl font-semibold tracking-tight text-foreground"
                    >
                      {signal.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted">
                      Detected{' '}
                      <time dateTime={getSignalDetectedAt(signal)}>
                        {format(new Date(getSignalDetectedAt(signal)), 'MMM d, yyyy')}
                      </time>
                      {' · '}
                      {formatDistanceToNow(new Date(getSignalDetectedAt(signal)), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <MetricTile
                      label="Lead score"
                      value={getSignalLeadScore(signal)?.toString() ?? '—'}
                    />
                    <MetricTile
                      label="Confidence"
                      value={formatConfidenceScore(signal.confidence_score) ?? '—'}
                    />
                    <MetricTile
                      label="Priority"
                      value={
                        signal.priority
                          ? signal.priority.charAt(0).toUpperCase() + signal.priority.slice(1)
                          : '—'
                      }
                    />
                  </div>

                  {signal.summary ? (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Summary
                      </h3>
                      <p className="text-sm leading-relaxed text-foreground">{signal.summary}</p>
                    </section>
                  ) : null}

                  {signal.raw_snippet ? (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Evidence
                      </h3>
                      <blockquote className="border-l-2 border-primary/30 bg-section-alt/60 px-4 py-3 text-sm italic leading-relaxed text-foreground">
                        {signal.raw_snippet}
                      </blockquote>
                    </section>
                  ) : null}

                  {getSignalRecommendation(signal) ? (
                    <section className="space-y-2">
                      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                        <Sparkles className="size-3.5 text-primary" />
                        AI recommendation
                      </h3>
                      <div className="rounded-xl border border-primary/20 bg-primary-soft/40 px-4 py-3 text-sm leading-relaxed text-foreground">
                        {getSignalRecommendation(signal)}
                      </div>
                    </section>
                  ) : null}

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Source
                    </h3>
                    <div className="space-y-1">
                      {signal.source_label ? (
                        <p className="text-sm font-medium text-foreground">{signal.source_label}</p>
                      ) : null}
                      {signal.source_url ? (
                        <a
                          href={signal.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {signal.source_url}
                          <ExternalLink className="size-3.5 shrink-0" />
                        </a>
                      ) : (
                        <p className="text-sm text-muted">No source URL</p>
                      )}
                      <p className="text-xs capitalize text-muted">
                        Source type: {signal.source_type.replace('_', ' ')}
                      </p>
                    </div>
                  </section>

                  {signal.status === 'dismissed' && signal.dismissed_reason ? (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Dismiss reason
                      </h3>
                      <p className="text-sm text-foreground">{signal.dismissed_reason}</p>
                    </section>
                  ) : null}

                  {signal.status === 'converted' && signal.converted_at ? (
                    <section className="rounded-xl border border-violet-200/80 bg-violet-50/50 px-4 py-3">
                      <p className="text-sm text-violet-800">
                        Converted{' '}
                        {format(new Date(signal.converted_at), 'MMM d, yyyy')}
                      </p>
                      <Link
                        to={`/leads?signal_id=${signal.id}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:underline"
                      >
                        <Users className="size-3.5" />
                        View lead
                      </Link>
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>

            {signal ? (
              <div className="border-t border-border/60 bg-surface-solid p-4">
                {signal.status === 'converted' ? (
                  <Link
                    to={`/leads?signal_id=${signal.id}`}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-3',
                      'text-sm font-semibold text-white shadow-[var(--shadow-button)]',
                      'transition-shadow hover:shadow-[var(--shadow-button-hover)]',
                    )}
                  >
                    <Users className="size-4" />
                    View Lead
                  </Link>
                ) : canConvertSignal(signal.status) ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={isActionPending}
                      onClick={() => onConvert(signal)}
                      className={cn(
                        'flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-3',
                        'text-sm font-semibold text-white shadow-[var(--shadow-button)]',
                        'transition-shadow hover:shadow-[var(--shadow-button-hover)] disabled:opacity-60',
                      )}
                    >
                      {isActionPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Users className="size-4" />
                      )}
                      Convert to Lead
                    </button>

                    <div className="flex flex-wrap gap-2">
                      {signal.status === 'new' ? (
                        <button
                          type="button"
                          disabled={isActionPending}
                          onClick={() =>
                            handleStatusUpdate({ status: 'reviewed' }, 'Marked as reviewed')
                          }
                          className="flex-1 rounded-xl border border-border/80 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-section-alt disabled:opacity-50"
                        >
                          Mark reviewed
                        </button>
                      ) : null}

                      {signal.status === 'new' || signal.status === 'reviewed' ? (
                        <button
                          type="button"
                          disabled={isActionPending}
                          onClick={() => handleStatusUpdate({ status: 'qualified' }, 'Signal qualified')}
                          className="flex-1 rounded-xl border border-border/80 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-section-alt disabled:opacity-50"
                        >
                          Qualify
                        </button>
                      ) : null}

                      <button
                        type="button"
                        disabled={isActionPending}
                        onClick={() => onDismiss(signal)}
                        className="flex-1 rounded-xl border border-border/80 px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-section-alt hover:text-foreground disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
