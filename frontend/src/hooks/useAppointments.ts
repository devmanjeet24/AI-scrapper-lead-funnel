import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

import {
  cancelAppointment,
  confirmAppointment,
  createAppointment,
  getAppointment,
  getConversationAvailability,
  listAppointments,
  proposeAppointment,
} from '@/api/appointments'
import {
  disconnectGoogleCalendar,
  getGoogleCalendarConnectUrl,
  getGoogleCalendarStatus,
} from '@/api/google-calendar'
import { dashboardKeys } from '@/hooks/useDashboardStats'
import { outreachKeys } from '@/hooks/useOutreach'
import type {
  AppointmentCreateRequest,
  AppointmentListParams,
  AppointmentProposeRequest,
} from '@/types/appointment'

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (params: AppointmentListParams) => [...appointmentKeys.lists(), params] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  availability: (conversationId: string) =>
    [...appointmentKeys.all, 'availability', conversationId] as const,
}

export const googleCalendarKeys = {
  all: ['google-calendar'] as const,
  status: () => [...googleCalendarKeys.all, 'status'] as const,
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
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

function invalidateAppointmentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  appointmentId: string,
) {
  queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(appointmentId) })
  queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
  queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
}

export function useAppointmentsQuery(params: AppointmentListParams) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => listAppointments(params),
  })
}

export function useAppointmentQuery(appointmentId: string | null) {
  return useQuery({
    queryKey: appointmentKeys.detail(appointmentId ?? ''),
    queryFn: () => getAppointment(appointmentId!),
    enabled: Boolean(appointmentId),
  })
}

export function useConversationAvailabilityQuery(
  conversationId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: appointmentKeys.availability(conversationId ?? ''),
    queryFn: () => getConversationAvailability(conversationId!),
    enabled: Boolean(conversationId) && enabled,
    retry: false,
  })
}

export function useGoogleCalendarStatusQuery() {
  return useQuery({
    queryKey: googleCalendarKeys.status(),
    queryFn: getGoogleCalendarStatus,
  })
}

export function useProposeAppointmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      payload = {},
    }: {
      conversationId: string
      payload?: AppointmentProposeRequest
    }) => proposeAppointment(conversationId, payload),
    onSuccess: (appointment) => {
      invalidateAppointmentQueries(queryClient, appointment.id)
      queryClient.invalidateQueries({
        queryKey: outreachKeys.conversationDetail(appointment.conversation_id),
      })
      toast.success('Appointment proposed')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to propose appointment.'))
    },
  })
}

export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string
      payload: AppointmentCreateRequest
    }) => createAppointment(conversationId, payload),
    onSuccess: (appointment) => {
      invalidateAppointmentQueries(queryClient, appointment.id)
      queryClient.invalidateQueries({
        queryKey: outreachKeys.conversationDetail(appointment.conversation_id),
      })
      toast.success(
        appointment.status === 'confirmed' ? 'Appointment confirmed' : 'Appointment booked',
      )
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to book appointment.'))
    },
  })
}

export function useConfirmAppointmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (appointmentId: string) => confirmAppointment(appointmentId),
    onSuccess: (appointment) => {
      invalidateAppointmentQueries(queryClient, appointment.id)
      queryClient.invalidateQueries({
        queryKey: outreachKeys.conversationDetail(appointment.conversation_id),
      })
      toast.success('Appointment confirmed')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to confirm appointment.'))
    },
  })
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (appointmentId: string) => cancelAppointment(appointmentId),
    onSuccess: (appointment) => {
      invalidateAppointmentQueries(queryClient, appointment.id)
      toast.success('Appointment cancelled')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to cancel appointment.'))
    },
  })
}

export function useConnectGoogleCalendarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: getGoogleCalendarConnectUrl,
    onSuccess: (response) => {
      window.open(response.authorization_url, '_blank', 'noopener,noreferrer')
      toast.message('Complete Google Calendar authorization in the new tab')

      const startedAt = Date.now()
      const pollInterval = window.setInterval(async () => {
        if (Date.now() - startedAt > 5 * 60 * 1000) {
          window.clearInterval(pollInterval)
          return
        }

        try {
          const status = await getGoogleCalendarStatus()
          if (status.connected) {
            window.clearInterval(pollInterval)
            queryClient.invalidateQueries({ queryKey: googleCalendarKeys.status() })
            toast.success('Google Calendar connected')
          }
        } catch {
          // Keep polling until timeout or success.
        }
      }, 2000)
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to start Google Calendar connection.'))
    },
  })
}

export function useDisconnectGoogleCalendarMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: disconnectGoogleCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleCalendarKeys.status() })
      toast.success('Google Calendar disconnected')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to disconnect Google Calendar.'))
    },
  })
}
