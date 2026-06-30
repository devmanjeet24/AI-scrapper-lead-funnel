import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createLead, listLeads } from '@/api/leads'
import type { LeadCreateRequest, LeadListParams } from '@/types/lead'

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (params: LeadListParams) => [...leadKeys.lists(), params] as const,
}

export function useLeadsQuery(params: LeadListParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => listLeads(params),
  })
}

export function useCreateLeadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LeadCreateRequest) => createLead(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
    },
  })
}
