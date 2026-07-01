import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

import { convertSignalToLead, getSignal, listSignals, updateSignal } from '@/api/signals'
import { dashboardKeys } from '@/hooks/useDashboardStats'
import { leadKeys } from '@/hooks/useLeads'
import type { Lead } from '@/types/lead'
import type {
  PaginatedSignalsResponse,
  Signal,
  SignalListParams,
  SignalUpdateRequest,
} from '@/types/signal'

export const signalKeys = {
  all: ['signals'] as const,
  lists: () => [...signalKeys.all, 'list'] as const,
  list: (params: SignalListParams) => [...signalKeys.lists(), params] as const,
  details: () => [...signalKeys.all, 'detail'] as const,
  detail: (id: string) => [...signalKeys.details(), id] as const,
}

function getMutationErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
  }
  if (error instanceof Error) return error.message
  return fallback
}

function patchSignalInCache(signal: Signal, payload: SignalUpdateRequest): Signal {
  return {
    ...signal,
    status: payload.status ?? signal.status,
    priority: payload.priority !== undefined ? payload.priority : signal.priority,
    dismissed_reason:
      payload.dismissed_reason !== undefined
        ? payload.dismissed_reason
        : signal.dismissed_reason,
  }
}

function patchListsInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  signalId: string,
  updater: (signal: Signal) => Signal,
) {
  queryClient.setQueriesData<PaginatedSignalsResponse>(
    { queryKey: signalKeys.lists() },
    (old) => {
      if (!old) return old
      return {
        ...old,
        items: old.items.map((item) => (item.id === signalId ? updater(item) : item)),
      }
    },
  )
}

export function useSignalsQuery(params: SignalListParams) {
  return useQuery({
    queryKey: signalKeys.list(params),
    queryFn: () => listSignals(params),
  })
}

export function useSignalQuery(signalId: string | null) {
  return useQuery({
    queryKey: signalKeys.detail(signalId ?? ''),
    queryFn: () => getSignal(signalId!),
    enabled: Boolean(signalId),
  })
}

export function useUpdateSignalMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ signalId, payload }: { signalId: string; payload: SignalUpdateRequest }) =>
      updateSignal(signalId, payload),
    onMutate: async ({ signalId, payload }) => {
      await queryClient.cancelQueries({ queryKey: signalKeys.detail(signalId) })
      await queryClient.cancelQueries({ queryKey: signalKeys.lists() })

      const previousDetail = queryClient.getQueryData<Signal>(signalKeys.detail(signalId))

      if (previousDetail) {
        queryClient.setQueryData(
          signalKeys.detail(signalId),
          patchSignalInCache(previousDetail, payload),
        )
      }

      patchListsInCache(queryClient, signalId, (signal) => patchSignalInCache(signal, payload))

      return { previousDetail }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(signalKeys.detail(updated.id), updated)
      patchListsInCache(queryClient, updated.id, () => updated)
    },
    onError: (error, { signalId }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(signalKeys.detail(signalId), context.previousDetail)
      }
      queryClient.invalidateQueries({ queryKey: signalKeys.lists() })
      toast.error(getMutationErrorMessage(error, 'Failed to update signal.'))
    },
    onSettled: (_data, error, { signalId }) => {
      if (!error) {
        queryClient.invalidateQueries({ queryKey: signalKeys.detail(signalId) })
        queryClient.invalidateQueries({ queryKey: signalKeys.lists() })
        queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
      }
    },
  })
}

export function useConvertSignalMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (signalId: string) => convertSignalToLead(signalId),
    onMutate: async (signalId) => {
      await queryClient.cancelQueries({ queryKey: signalKeys.detail(signalId) })
      await queryClient.cancelQueries({ queryKey: signalKeys.lists() })

      const previousDetail = queryClient.getQueryData<Signal>(signalKeys.detail(signalId))
      const optimisticStatus = {
        status: 'converted' as const,
        converted_at: new Date().toISOString(),
      }

      if (previousDetail) {
        queryClient.setQueryData(signalKeys.detail(signalId), {
          ...previousDetail,
          ...optimisticStatus,
        })
      }

      patchListsInCache(queryClient, signalId, (signal) => ({
        ...signal,
        ...optimisticStatus,
      }))

      return { previousDetail }
    },
    onSuccess: (lead: Lead, signalId) => {
      queryClient.setQueriesData<PaginatedSignalsResponse>(
        { queryKey: signalKeys.lists() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === signalId
                ? { ...item, status: 'converted', converted_at: lead.created_at }
                : item,
            ),
          }
        },
      )

      queryClient.invalidateQueries({ queryKey: signalKeys.detail(signalId) })
      queryClient.invalidateQueries({ queryKey: signalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })

      toast.success('Lead created from signal', {
        action: {
          label: 'View Lead',
          onClick: () => {
            window.location.href = `/leads?signal_id=${signalId}`
          },
        },
      })
    },
    onError: (error, signalId, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(signalKeys.detail(signalId), context.previousDetail)
      }
      queryClient.invalidateQueries({ queryKey: signalKeys.lists() })
      toast.error(getMutationErrorMessage(error, 'Failed to convert signal to lead.'))
    },
  })
}
