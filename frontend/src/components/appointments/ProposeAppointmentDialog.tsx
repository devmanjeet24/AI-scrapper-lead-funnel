import { format } from 'date-fns'
import { Loader2, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getLead } from '@/api/leads'
import { GoogleCalendarStatusBanner } from '@/components/appointments/GoogleCalendarStatusBanner'
import {
  useConversationAvailabilityQuery,
  useCreateAppointmentMutation,
  useProposeAppointmentMutation,
} from '@/hooks/useAppointments'
import { useOutreachConversationQuery } from '@/hooks/useOutreach'
import { getApiErrorMessage, isGoogleCalendarNotConnectedError } from '@/lib/appointments'
import { cn } from '@/lib/utils'
import type { AvailabilitySlot } from '@/types/appointment'

interface ProposeAppointmentDialogProps {
  open: boolean
  conversationId: string | null
  onClose: () => void
  onBooked?: (appointmentId: string) => void
}

function formatSlotLabel(slot: AvailabilitySlot): string {
  const start = new Date(slot.starts_at)
  const end = new Date(slot.ends_at)
  return `${format(start, 'EEE, MMM d · h:mm a')} – ${format(end, 'h:mm a')}`
}

export function ProposeAppointmentDialog({
  open,
  conversationId,
  onClose,
  onBooked,
}: ProposeAppointmentDialogProps) {
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null)
  const [attendeeName, setAttendeeName] = useState('')
  const [attendeeEmail, setAttendeeEmail] = useState('')
  const [notes, setNotes] = useState('')

  const { data: conversation } = useOutreachConversationQuery(conversationId)
  const { data: lead } = useQuery({
    queryKey: ['leads', 'detail', conversation?.lead_id ?? ''],
    queryFn: () => getLead(conversation!.lead_id),
    enabled: Boolean(conversation?.lead_id),
  })

  const {
    data: availability,
    isLoading: isAvailabilityLoading,
    isError: isAvailabilityError,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useConversationAvailabilityQuery(conversationId, open)

  const proposeMutation = useProposeAppointmentMutation()
  const createMutation = useCreateAppointmentMutation()

  const slots = availability?.slots ?? []
  const selectedSlot = slots.find(
    (slot) => `${slot.starts_at}|${slot.ends_at}` === selectedSlotKey,
  )

  const isSubmitting = proposeMutation.isPending || createMutation.isPending
  const calendarDisconnected = isAvailabilityError && isGoogleCalendarNotConnectedError(availabilityError)

  useEffect(() => {
    if (!open) {
      setSelectedSlotKey(null)
      setAttendeeName('')
      setAttendeeEmail('')
      setNotes('')
    }
  }, [open, conversationId])

  useEffect(() => {
    if (lead?.title && !attendeeName) {
      setAttendeeName(lead.title)
    }
  }, [lead?.title, attendeeName])

  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  async function handleAiPropose() {
    if (!conversationId) return
    const appointment = await proposeMutation.mutateAsync({
      conversationId,
      payload: {
        attendee_name: attendeeName.trim() || undefined,
        attendee_email: attendeeEmail.trim() || undefined,
        notes: notes.trim() || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      },
    })
    onBooked?.(appointment.id)
    onClose()
  }

  async function handleBookSelectedSlot() {
    if (!conversationId || !selectedSlot) return
    const appointment = await createMutation.mutateAsync({
      conversationId,
      payload: {
        starts_at: selectedSlot.starts_at,
        ends_at: selectedSlot.ends_at,
        attendee_name: attendeeName.trim() || undefined,
        attendee_email: attendeeEmail.trim() || undefined,
        description: notes.trim() || undefined,
        timezone: selectedSlot.timezone,
        confirm_immediately: false,
      },
    })
    onBooked?.(appointment.id)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="propose-appointment-title"
        className={cn(
          'relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl',
          'border border-border/80 bg-surface-solid shadow-[var(--shadow-float)]',
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Book appointment
            </p>
            <h2 id="propose-appointment-title" className="text-lg font-semibold text-foreground">
              {lead?.title ?? 'Outreach conversation'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-section-alt hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <GoogleCalendarStatusBanner />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="attendee-name" className="text-sm font-medium text-foreground">
                Attendee name
              </label>
              <input
                id="attendee-name"
                value={attendeeName}
                onChange={(event) => setAttendeeName(event.target.value)}
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="attendee-email" className="text-sm font-medium text-foreground">
                Attendee email
              </label>
              <input
                id="attendee-email"
                type="email"
                value={attendeeEmail}
                onChange={(event) => setAttendeeEmail(event.target.value)}
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="appointment-notes" className="text-sm font-medium text-foreground">
              Notes
            </label>
            <textarea
              id="appointment-notes"
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional context for the booking agent…"
              className="w-full resize-none rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm"
            />
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Available slots
              </h3>
              {!isAvailabilityLoading && !calendarDisconnected ? (
                <button
                  type="button"
                  onClick={() => refetchAvailability()}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Refresh
                </button>
              ) : null}
            </div>

            {isAvailabilityLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-section-alt/40 px-4 py-6 text-sm text-muted">
                <Loader2 className="size-4 animate-spin" />
                Loading availability…
              </div>
            ) : null}

            {calendarDisconnected ? (
              <div className="rounded-xl border border-dashed border-amber-200/80 bg-amber-50/40 px-4 py-6 text-center">
                <p className="text-sm font-medium text-amber-900">Calendar unavailable</p>
                <p className="mt-1 text-xs text-amber-800/80">
                  Connect Google Calendar above to load open slots. You can still use AI propose once
                  connected.
                </p>
              </div>
            ) : null}

            {isAvailabilityError && !calendarDisconnected ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {getApiErrorMessage(availabilityError, 'Failed to load availability.')}
              </div>
            ) : null}

            {!isAvailabilityLoading && !isAvailabilityError && slots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-section-alt/30 px-4 py-6 text-center text-sm text-muted">
                No open slots found in the booking horizon.
              </div>
            ) : null}

            {slots.length > 0 ? (
              <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-border/80 bg-section-alt/20 p-2">
                {slots.map((slot) => {
                  const key = `${slot.starts_at}|${slot.ends_at}`
                  const isSelected = selectedSlotKey === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedSlotKey(key)}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                        isSelected
                          ? 'border-primary bg-primary-soft/50 text-foreground'
                          : 'border-transparent bg-surface-solid text-foreground hover:border-border/80',
                      )}
                    >
                      {formatSlotLabel(slot)}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </section>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 bg-surface-solid p-4 sm:flex-row">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleAiPropose}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-primary px-4 py-3',
              'text-sm font-semibold text-white shadow-[var(--shadow-button)] disabled:opacity-60',
            )}
          >
            {proposeMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            AI propose slot
          </button>
          <button
            type="button"
            disabled={isSubmitting || !selectedSlot}
            onClick={handleBookSelectedSlot}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-4 py-3',
              'text-sm font-semibold text-foreground transition-colors hover:bg-section-alt disabled:opacity-60',
            )}
          >
            {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Book selected slot
          </button>
        </div>
      </div>
    </div>
  )
}
