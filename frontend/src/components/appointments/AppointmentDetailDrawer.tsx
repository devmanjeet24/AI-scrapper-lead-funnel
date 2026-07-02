import { format, formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  ExternalLink,
  Loader2,
  MessageSquare,
  Send,
  Users,
  X,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { getLead } from '@/api/leads'
import { AppointmentStatusBadge } from '@/components/appointments/AppointmentStatusBadge'
import {
  useAppointmentQuery,
  useCancelAppointmentMutation,
  useConfirmAppointmentMutation,
} from '@/hooks/useAppointments'
import { useOutreachCampaignQuery } from '@/hooks/useOutreach'
import {
  canCancelAppointment,
  canConfirmAppointment,
  getAppointmentNotes,
} from '@/lib/appointments'
import { getCampaignDisplaySubject } from '@/lib/outreach'
import { cn } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

interface AppointmentDetailDrawerProps {
  appointmentId: string | null
  onClose: () => void
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-foreground/5" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-foreground/5" />
      </div>
      <div className="h-8 w-3/4 animate-pulse rounded bg-foreground/5" />
      <div className="h-24 animate-pulse rounded-xl bg-foreground/5" />
    </div>
  )
}

export function AppointmentDetailDrawer({
  appointmentId,
  onClose,
}: AppointmentDetailDrawerProps) {
  const { data: appointment, isLoading, isError } = useAppointmentQuery(appointmentId)
  const { data: campaign } = useOutreachCampaignQuery(appointment?.campaign_id ?? null)
  const confirmMutation = useConfirmAppointmentMutation()
  const cancelMutation = useCancelAppointmentMutation()

  const { data: lead } = useQuery({
    queryKey: ['leads', 'detail', appointment?.lead_id ?? ''],
    queryFn: () => getLead(appointment!.lead_id),
    enabled: Boolean(appointment?.lead_id),
  })

  useEffect(() => {
    if (!appointmentId) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [appointmentId, onClose])

  const notes = appointment ? getAppointmentNotes(appointment) : null
  const isActionPending = confirmMutation.isPending || cancelMutation.isPending
  const showConfirm = appointment ? canConfirmAppointment(appointment) : false
  const showCancel = appointment ? canCancelAppointment(appointment) : false

  return (
    <AnimatePresence>
      {appointmentId ? (
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
            aria-labelledby="appointment-drawer-title"
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
              <p className="text-sm font-semibold text-foreground">Appointment details</p>
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
                  <p className="text-sm text-muted">Unable to load appointment details.</p>
                </div>
              ) : null}

              {appointment ? (
                <div className="space-y-6 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>

                  <div>
                    <h2
                      id="appointment-drawer-title"
                      className="text-xl font-semibold tracking-tight text-foreground"
                    >
                      {appointment.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted">
                      Created{' '}
                      <time dateTime={appointment.created_at}>
                        {format(new Date(appointment.created_at), 'MMM d, yyyy')}
                      </time>
                      {' · '}
                      {formatDistanceToNow(new Date(appointment.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Date & time
                    </h3>
                    <div className="rounded-xl border border-border/80 bg-section-alt/40 px-4 py-3">
                      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Calendar className="size-3.5 text-muted" />
                        <time dateTime={appointment.starts_at}>
                          {format(new Date(appointment.starts_at), 'EEEE, MMM d, yyyy')}
                        </time>
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {format(new Date(appointment.starts_at), 'h:mm a')} –{' '}
                        {format(new Date(appointment.ends_at), 'h:mm a')} ({appointment.timezone})
                      </p>
                      {appointment.google_event_link ? (
                        <a
                          href={appointment.google_event_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          Open in Google Calendar
                          <ExternalLink className="size-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Connected records
                    </h3>
                    <div className="space-y-2 rounded-xl border border-border/80 bg-section-alt/40 p-3">
                      {lead ? (
                        <Link
                          to={`/leads?lead_id=${lead.id}`}
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          <Users className="size-3.5" />
                          {lead.title}
                        </Link>
                      ) : (
                        <p className="text-sm text-muted">Lead {appointment.lead_id.slice(0, 8)}…</p>
                      )}
                      <Link
                        to={`/outreach/conversations/${appointment.conversation_id}?campaign_id=${appointment.campaign_id}`}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        <MessageSquare className="size-3.5" />
                        Conversation workspace
                      </Link>
                      {campaign ? (
                        <Link
                          to={`/outreach?campaign_id=${campaign.id}`}
                          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          <Send className="size-3.5" />
                          {getCampaignDisplaySubject(campaign)}
                        </Link>
                      ) : (
                        <p className="text-sm text-muted">
                          Campaign {appointment.campaign_id.slice(0, 8)}…
                        </p>
                      )}
                    </div>
                  </section>

                  {(appointment.attendee_name || appointment.attendee_email) && (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Attendee
                      </h3>
                      <div className="text-sm text-foreground">
                        {appointment.attendee_name ? <p>{appointment.attendee_name}</p> : null}
                        {appointment.attendee_email ? (
                          <p className="text-muted">{appointment.attendee_email}</p>
                        ) : null}
                      </div>
                    </section>
                  )}

                  {notes ? (
                    <section className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Notes
                      </h3>
                      <p className="rounded-xl border border-border/80 bg-section-alt/40 px-4 py-3 text-sm leading-relaxed text-foreground">
                        {notes}
                      </p>
                    </section>
                  ) : null}

                  {appointment.error_message ? (
                    <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {appointment.error_message}
                    </section>
                  ) : null}
                </div>
              ) : null}
            </div>

            {appointment && (showConfirm || showCancel) ? (
              <div className="space-y-2 border-t border-border/60 bg-surface-solid p-4">
                {showConfirm ? (
                  <button
                    type="button"
                    disabled={isActionPending}
                    onClick={() => confirmMutation.mutate(appointment.id)}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 py-3',
                      'text-sm font-semibold text-white shadow-[var(--shadow-button)]',
                      'transition-shadow hover:shadow-[var(--shadow-button-hover)] disabled:opacity-60',
                    )}
                  >
                    {confirmMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Calendar className="size-4" />
                    )}
                    Confirm appointment
                  </button>
                ) : null}
                {showCancel ? (
                  <button
                    type="button"
                    disabled={isActionPending}
                    onClick={() => cancelMutation.mutate(appointment.id)}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-5 py-3',
                      'text-sm font-semibold text-foreground transition-colors hover:bg-section-alt disabled:opacity-60',
                    )}
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Cancel appointment
                  </button>
                ) : null}
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
