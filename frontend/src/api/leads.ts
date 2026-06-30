import type {
  Lead,
  LeadCreateRequest,
  LeadListParams,
  PaginatedLeadsResponse,
} from '@/types/lead'

import { apiClient } from './client'

export async function listLeads(params: LeadListParams = {}): Promise<PaginatedLeadsResponse> {
  const { data } = await apiClient.get<PaginatedLeadsResponse>('/leads', { params })
  return data
}

export async function createLead(payload: LeadCreateRequest): Promise<Lead> {
  const { data } = await apiClient.post<Lead>('/leads', payload)
  return data
}
