import type {
  CreativeAsset,
  CreativeAssetUpdateRequest,
  CreativeGenerateRequest,
  CreativeSet,
  PaginatedCreativeAssetsResponse,
  PaginatedCreativeSetsResponse,
} from '@/types/creative'

import { apiClient } from './client'

export async function generateCreativeSet(
  leadId: string,
  payload: CreativeGenerateRequest = {},
): Promise<CreativeSet> {
  const { data } = await apiClient.post<CreativeSet>(`/leads/${leadId}/creative-sets`, payload)
  return data
}

export async function listCreativeSetsForLead(
  leadId: string,
  params: { limit?: number; offset?: number } = {},
): Promise<PaginatedCreativeSetsResponse> {
  const { data } = await apiClient.get<PaginatedCreativeSetsResponse>(
    `/leads/${leadId}/creative-sets`,
    { params },
  )
  return data
}

export async function getCreativeSet(creativeSetId: string): Promise<CreativeSet> {
  const { data } = await apiClient.get<CreativeSet>(`/creative-sets/${creativeSetId}`)
  return data
}

export async function listCreativeAssets(
  params: {
    creative_set_id?: string
    lead_id?: string
    status?: string
    limit?: number
    offset?: number
  } = {},
): Promise<PaginatedCreativeAssetsResponse> {
  const { data } = await apiClient.get<PaginatedCreativeAssetsResponse>('/creative-assets', {
    params,
  })
  return data
}

export async function updateCreativeAsset(
  assetId: string,
  payload: CreativeAssetUpdateRequest,
): Promise<CreativeAsset> {
  const { data } = await apiClient.patch<CreativeAsset>(`/creative-assets/${assetId}`, payload)
  return data
}
