import { isAxiosError } from 'axios'

import type {
  Appointment,
  AppointmentListTab,
  AppointmentSortField,
  SortDirection,
} from '@/types/appointment'
import type { Lead } from '@/types/lead'

export { PAGE_SIZE, SEARCH_FETCH_LIMIT } from '@/lib/leads'

export const APPOINTMENT_TAB_OPTIONS: { value: AppointmentListTab; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
]

const STATUS_ORDER: Record<string, number> = {
  pending_confirmation: 1,
  proposed: 2,
  confirmed: 3,
  failed: 4,
  cancelled: 5,
}

export function isAppointmentUpcoming(appointment: Appointment, now = new Date()): boolean {
  return (
    new Date(appointment.starts_at) >= now &&
    ['proposed', 'pending_confirmation', 'confirmed'].includes(appointment.status)
  )
}

export function isAppointmentCompleted(appointment: Appointment, now = new Date()): boolean {
  return appointment.status === 'confirmed' && new Date(appointment.ends_at) < now
}

export function filterAppointmentsByTab(
  appointments: Appointment[],
  tab: AppointmentListTab,
  now = new Date(),
): Appointment[] {
  switch (tab) {
    case 'upcoming':
      return appointments.filter((appointment) => isAppointmentUpcoming(appointment, now))
    case 'confirmed':
      return appointments.filter(
        (appointment) =>
          appointment.status === 'confirmed' && new Date(appointment.ends_at) >= now,
      )
    case 'pending':
      return appointments.filter((appointment) =>
        ['proposed', 'pending_confirmation', 'failed'].includes(appointment.status),
      )
    case 'cancelled':
      return appointments.filter((appointment) => appointment.status === 'cancelled')
    case 'completed':
      return appointments.filter((appointment) => isAppointmentCompleted(appointment, now))
    default:
      return appointments
  }
}

export function filterAppointmentsBySearch(
  appointments: Appointment[],
  query: string,
  leadMap: Map<string, Lead>,
): Appointment[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return appointments

  return appointments.filter((appointment) => {
    const lead = leadMap.get(appointment.lead_id)
    const haystack = [
      appointment.title,
      appointment.description,
      appointment.attendee_name,
      appointment.attendee_email,
      appointment.status,
      lead?.title,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalized)
  })
}

export function sortAppointments(
  appointments: Appointment[],
  field: AppointmentSortField,
  direction: SortDirection,
): Appointment[] {
  const sorted = [...appointments].sort((a, b) => {
    let result = 0

    switch (field) {
      case 'title':
        result = a.title.localeCompare(b.title)
        break
      case 'status':
        result = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
        break
      case 'starts_at':
        result = new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        break
      case 'created_at':
        result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
    }

    return direction === 'asc' ? result : -result
  })

  return sorted
}

export function canConfirmAppointment(appointment: Appointment): boolean {
  return ['proposed', 'pending_confirmation'].includes(appointment.status)
}

export function canCancelAppointment(appointment: Appointment): boolean {
  return ['proposed', 'pending_confirmation', 'confirmed'].includes(appointment.status)
}

export function getAppointmentNotes(appointment: Appointment): string | null {
  if (appointment.description?.trim()) return appointment.description.trim()

  const proposal = appointment.agent_metadata.booking_proposal
  if (proposal && typeof proposal === 'object') {
    const agenda = (proposal as { meeting_agenda?: unknown }).meeting_agenda
    if (typeof agenda === 'string' && agenda.trim()) return agenda.trim()
  }

  return null
}

export function isGoogleCalendarNotConnectedError(error: unknown): boolean {
  if (!isAxiosError(error)) return false

  const detail = error.response?.data?.detail
  if (detail && typeof detail === 'object' && 'code' in detail) {
    return (detail as { code: string }).code === 'google_calendar_not_connected'
  }

  return error.response?.status === 503
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (detail && typeof detail === 'object' && 'message' in detail) {
      return String((detail as { message: string }).message)
    }
  }
  if (error instanceof Error) return error.message
  return fallback
}
