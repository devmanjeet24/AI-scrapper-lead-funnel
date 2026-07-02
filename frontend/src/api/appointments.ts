import type {
  Appointment,
  AppointmentCreateRequest,
  AppointmentListParams,
  AppointmentProposeRequest,
  AvailabilityResponse,
  PaginatedAppointmentsResponse,
} from '@/types/appointment'

import { apiClient } from './client'

export async function listAppointments(
  params: AppointmentListParams = {},
): Promise<PaginatedAppointmentsResponse> {
  const { data } = await apiClient.get<PaginatedAppointmentsResponse>('/appointments', { params })
  return data
}

export async function getAppointment(appointmentId: string): Promise<Appointment> {
  const { data } = await apiClient.get<Appointment>(`/appointments/${appointmentId}`)
  return data
}

export async function getConversationAvailability(
  conversationId: string,
  params: { duration_minutes?: number; horizon_days?: number; timezone?: string } = {},
): Promise<AvailabilityResponse> {
  const { data } = await apiClient.get<AvailabilityResponse>(
    `/outreach-conversations/${conversationId}/availability`,
    { params },
  )
  return data
}

export async function proposeAppointment(
  conversationId: string,
  payload: AppointmentProposeRequest = {},
): Promise<Appointment> {
  const { data } = await apiClient.post<Appointment>(
    `/outreach-conversations/${conversationId}/appointments/propose`,
    payload,
  )
  return data
}

export async function createAppointment(
  conversationId: string,
  payload: AppointmentCreateRequest,
): Promise<Appointment> {
  const { data } = await apiClient.post<Appointment>(
    `/outreach-conversations/${conversationId}/appointments`,
    payload,
  )
  return data
}

export async function confirmAppointment(appointmentId: string): Promise<Appointment> {
  const { data } = await apiClient.post<Appointment>(`/appointments/${appointmentId}/confirm`)
  return data
}

export async function cancelAppointment(appointmentId: string): Promise<Appointment> {
  const { data } = await apiClient.post<Appointment>(`/appointments/${appointmentId}/cancel`)
  return data
}
