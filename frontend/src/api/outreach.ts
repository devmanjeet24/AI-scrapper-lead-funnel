import type {
  LeadReplyCreateRequest,
  OutreachCampaign,
  OutreachCampaignCreateRequest,
  OutreachCampaignListParams,
  OutreachConversation,
  PaginatedOutreachCampaignsResponse,
  PaginatedOutreachMessagesResponse,
  VettingResponse,
} from '@/types/outreach'

import { apiClient } from './client'

export async function listOutreachCampaigns(
  params: OutreachCampaignListParams = {},
): Promise<PaginatedOutreachCampaignsResponse> {
  const { data } = await apiClient.get<PaginatedOutreachCampaignsResponse>('/outreach-campaigns', {
    params,
  })
  return data
}

export async function getOutreachCampaign(campaignId: string): Promise<OutreachCampaign> {
  const { data } = await apiClient.get<OutreachCampaign>(`/outreach-campaigns/${campaignId}`)
  return data
}

export async function createOutreachCampaignForLead(
  leadId: string,
  payload: OutreachCampaignCreateRequest = {},
): Promise<OutreachCampaign> {
  const { data } = await apiClient.post<OutreachCampaign>(
    `/leads/${leadId}/outreach-campaigns`,
    payload,
  )
  return data
}

export async function createOutreachCampaignFromDeployment(
  packageId: string,
  payload: OutreachCampaignCreateRequest = {},
): Promise<OutreachCampaign> {
  const { data } = await apiClient.post<OutreachCampaign>(
    `/deployment-packages/${packageId}/outreach-campaigns`,
    payload,
  )
  return data
}

export async function listCampaignConversations(
  campaignId: string,
): Promise<OutreachConversation[]> {
  const { data } = await apiClient.get<OutreachConversation[]>(
    `/outreach-campaigns/${campaignId}/conversations`,
  )
  return data
}

export async function getOutreachConversation(
  conversationId: string,
): Promise<OutreachConversation> {
  const { data } = await apiClient.get<OutreachConversation>(
    `/outreach-conversations/${conversationId}`,
  )
  return data
}

export async function listConversationMessages(
  conversationId: string,
  params: { limit?: number; offset?: number } = {},
): Promise<PaginatedOutreachMessagesResponse> {
  const { data } = await apiClient.get<PaginatedOutreachMessagesResponse>(
    `/outreach-conversations/${conversationId}/messages`,
    { params },
  )
  return data
}

export async function addLeadReply(
  conversationId: string,
  payload: LeadReplyCreateRequest,
): Promise<OutreachConversation> {
  const { data } = await apiClient.post<OutreachConversation>(
    `/outreach-conversations/${conversationId}/messages`,
    payload,
  )
  return data
}

export async function vetConversation(conversationId: string): Promise<VettingResponse> {
  const { data } = await apiClient.post<VettingResponse>(
    `/outreach-conversations/${conversationId}/vet`,
  )
  return data
}
