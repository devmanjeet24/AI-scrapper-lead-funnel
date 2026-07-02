import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

import {
  generateCreativeSet,
  getCreativeSet,
  listCreativeAssets,
  listCreativeSetsForLead,
  updateCreativeAsset,
} from '@/api/creatives'
import { dashboardKeys } from '@/hooks/useDashboardStats'
import type {
  CreativeAssetUpdateRequest,
  CreativeGenerateRequest,
  CreativeSet,
} from '@/types/creative'

export const creativeKeys = {
  all: ['creatives'] as const,
  sets: (leadId: string) => [...creativeKeys.all, 'sets', leadId] as const,
  set: (setId: string) => [...creativeKeys.all, 'set', setId] as const,
  assets: (leadId: string) => [...creativeKeys.all, 'assets', leadId] as const,
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

export function useCreativeSetsQuery(leadId: string | null) {
  return useQuery({
    queryKey: creativeKeys.sets(leadId ?? ''),
    queryFn: () => listCreativeSetsForLead(leadId!),
    enabled: Boolean(leadId),
  })
}

export function useCreativeAssetsQuery(leadId: string | null) {
  return useQuery({
    queryKey: creativeKeys.assets(leadId ?? ''),
    queryFn: () => listCreativeAssets({ lead_id: leadId!, limit: 100 }),
    enabled: Boolean(leadId),
  })
}

export function useCreativeSetQuery(creativeSetId: string | null) {
  return useQuery({
    queryKey: creativeKeys.set(creativeSetId ?? ''),
    queryFn: () => getCreativeSet(creativeSetId!),
    enabled: Boolean(creativeSetId),
  })
}

function invalidateCreativeQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  leadId: string,
) {
  queryClient.invalidateQueries({ queryKey: creativeKeys.sets(leadId) })
  queryClient.invalidateQueries({ queryKey: creativeKeys.assets(leadId) })
  queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
}

export function useGenerateCreativesMutation(leadId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreativeGenerateRequest = {}) => generateCreativeSet(leadId, payload),
    onSuccess: (creativeSet: CreativeSet) => {
      invalidateCreativeQueries(queryClient, leadId)
      queryClient.setQueryData(creativeKeys.set(creativeSet.id), creativeSet)
      toast.success('Creative set generated')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to generate creatives.'))
    },
  })
}

export function useUpdateCreativeAssetMutation(leadId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      assetId,
      payload,
    }: {
      assetId: string
      payload: CreativeAssetUpdateRequest
    }) => updateCreativeAsset(assetId, payload),
    onSuccess: () => {
      invalidateCreativeQueries(queryClient, leadId)
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to update creative asset.'))
    },
  })
}
