import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

import { archiveLead, createLead, getLead, listLeads, updateLead } from '@/api/leads'
import { dashboardKeys } from '@/hooks/useDashboardStats'
import type {
  Lead,
  LeadCreateRequest,
  LeadListParams,
  LeadUpdateRequest,
  PaginatedLeadsResponse,
} from '@/types/lead'

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (params: LeadListParams) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
  }
  if (error instanceof Error) return error.message
  return fallback
}

function patchLeadInLists(
  queryClient: ReturnType<typeof useQueryClient>,
  leadId: string,
  updater: (lead: Lead) => Lead,
) {
  queryClient.setQueriesData<PaginatedLeadsResponse>({ queryKey: leadKeys.lists() }, (old) => {
    if (!old) return old
    return {
      ...old,
      items: old.items.map((item) => (item.id === leadId ? updater(item) : item)),
    }
  })
}

export function useLeadsQuery(params: LeadListParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => listLeads(params),
  })
}

export function useLeadQuery(leadId: string | null) {
  return useQuery({
    queryKey: leadKeys.detail(leadId ?? ''),
    queryFn: () => getLead(leadId!),
    enabled: Boolean(leadId),
  })
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LeadCreateRequest) => createLead(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
      toast.success('Lead created')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to create lead.'))
    },
  })
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leadId, payload }: { leadId: string; payload: LeadUpdateRequest }) =>
      updateLead(leadId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(leadKeys.detail(updated.id), updated)
      patchLeadInLists(queryClient, updated.id, () => updated)
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to update lead.'))
    },
  })
}

export function useArchiveLeadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (leadId: string) => archiveLead(leadId),
    onSuccess: (_data, leadId) => {
      queryClient.removeQueries({ queryKey: leadKeys.detail(leadId) })
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
      toast.success('Lead archived')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to archive lead.'))
    },
  })
}
