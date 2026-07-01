import type { Lead } from '@/types/lead'
import type {
  PaginatedSignalsResponse,
  Signal,
  SignalListParams,
  SignalUpdateRequest,
} from '@/types/signal'

import { apiClient } from './client'

export async function listSignals(
  params: SignalListParams = {},
): Promise<PaginatedSignalsResponse> {
  const { data } = await apiClient.get<PaginatedSignalsResponse>('/signals', { params })
  return data
}

export async function getSignal(signalId: string): Promise<Signal> {
  const { data } = await apiClient.get<Signal>(`/signals/${signalId}`)
  return data
}

export async function updateSignal(
  signalId: string,
  payload: SignalUpdateRequest,
): Promise<Signal> {
  const { data } = await apiClient.patch<Signal>(`/signals/${signalId}`, payload)
  return data
}

export async function convertSignalToLead(signalId: string): Promise<Lead> {
  const { data } = await apiClient.post<Lead>(`/signals/${signalId}/convert`)
  return data
}
