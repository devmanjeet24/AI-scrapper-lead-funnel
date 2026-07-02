import type {
  Lead,
  LeadCreateRequest,
  LeadListParams,
  LeadUpdateRequest,
  PaginatedLeadsResponse,
} from '@/types/lead'

import { apiClient } from './client'

export async function listLeads(params: LeadListParams = {}): Promise<PaginatedLeadsResponse> {
  const { data } = await apiClient.get<PaginatedLeadsResponse>('/leads', { params })
  return data
}

export async function getLead(leadId: string): Promise<Lead> {
  const { data } = await apiClient.get<Lead>(`/leads/${leadId}`)
  return data
}

export async function createLead(payload: LeadCreateRequest): Promise<Lead> {
  const { data } = await apiClient.post<Lead>('/leads', payload)
  return data
}

export async function updateLead(leadId: string, payload: LeadUpdateRequest): Promise<Lead> {
  const { data } = await apiClient.patch<Lead>(`/leads/${leadId}`, payload)
  return data
}

export async function archiveLead(leadId: string): Promise<void> {
  await apiClient.delete(`/leads/${leadId}`)
}
