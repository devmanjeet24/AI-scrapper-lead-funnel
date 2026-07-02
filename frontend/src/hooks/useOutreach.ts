import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'

import {
  addLeadReply,
  createOutreachCampaignForLead,
  createOutreachCampaignFromDeployment,
  getOutreachCampaign,
  getOutreachConversation,
  listCampaignConversations,
  listConversationMessages,
  listOutreachCampaigns,
  vetConversation,
} from '@/api/outreach'
import { dashboardKeys } from '@/hooks/useDashboardStats'
import { leadKeys } from '@/hooks/useLeads'
import type {
  LeadReplyCreateRequest,
  OutreachCampaignCreateRequest,
  OutreachCampaignListParams,
  OutreachConversation,
} from '@/types/outreach'

export const outreachKeys = {
  all: ['outreach'] as const,
  lists: () => [...outreachKeys.all, 'list'] as const,
  list: (params: OutreachCampaignListParams) => [...outreachKeys.lists(), params] as const,
  details: () => [...outreachKeys.all, 'detail'] as const,
  detail: (id: string) => [...outreachKeys.details(), id] as const,
  conversations: (campaignId: string) => [...outreachKeys.all, 'conversations', campaignId] as const,
  messages: (conversationId: string) => [...outreachKeys.all, 'messages', conversationId] as const,
  conversationDetails: () => [...outreachKeys.all, 'conversation'] as const,
  conversationDetail: (id: string) => [...outreachKeys.conversationDetails(), id] as const,
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

export function useOutreachCampaignsQuery(params: OutreachCampaignListParams) {
  return useQuery({
    queryKey: outreachKeys.list(params),
    queryFn: () => listOutreachCampaigns(params),
  })
}

export function useOutreachCampaignQuery(campaignId: string | null) {
  return useQuery({
    queryKey: outreachKeys.detail(campaignId ?? ''),
    queryFn: () => getOutreachCampaign(campaignId!),
    enabled: Boolean(campaignId),
  })
}

export function useCampaignConversationsQuery(campaignId: string | null) {
  return useQuery({
    queryKey: outreachKeys.conversations(campaignId ?? ''),
    queryFn: () => listCampaignConversations(campaignId!),
    enabled: Boolean(campaignId),
  })
}

export function useConversationMessagesQuery(conversationId: string | null) {
  return useQuery({
    queryKey: outreachKeys.messages(conversationId ?? ''),
    queryFn: () => listConversationMessages(conversationId!, { limit: 100 }),
    enabled: Boolean(conversationId),
  })
}

export function useOutreachConversationQuery(conversationId: string | null) {
  return useQuery({
    queryKey: outreachKeys.conversationDetail(conversationId ?? ''),
    queryFn: () => getOutreachConversation(conversationId!),
    enabled: Boolean(conversationId),
  })
}

function invalidateConversationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  conversation: OutreachConversation,
) {
  queryClient.invalidateQueries({
    queryKey: outreachKeys.conversationDetail(conversation.id),
  })
  queryClient.invalidateQueries({ queryKey: outreachKeys.messages(conversation.id) })
  queryClient.invalidateQueries({
    queryKey: outreachKeys.conversations(conversation.campaign_id),
  })
  queryClient.invalidateQueries({
    queryKey: outreachKeys.detail(conversation.campaign_id),
  })
  queryClient.invalidateQueries({ queryKey: outreachKeys.lists() })
  queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
}

export function useAddLeadReplyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string
      payload: LeadReplyCreateRequest
    }) => addLeadReply(conversationId, payload),
    onSuccess: (conversation) => {
      invalidateConversationQueries(queryClient, conversation)
      queryClient.setQueryData(
        outreachKeys.conversationDetail(conversation.id),
        conversation,
      )
      toast.success('Reply sent')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to send reply.'))
    },
  })
}

export function useVetConversationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => vetConversation(conversationId),
    onSuccess: (result) => {
      invalidateConversationQueries(queryClient, result.conversation)
      queryClient.setQueryData(
        outreachKeys.conversationDetail(result.conversation.id),
        result.conversation,
      )
      toast.success('Conversation vetted')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to vet conversation.'))
    },
  })
}

export function useCreateOutreachCampaignMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      leadId,
      deploymentPackageId,
      payload = {},
    }: {
      leadId?: string
      deploymentPackageId?: string
      payload?: OutreachCampaignCreateRequest
    }) => {
      if (deploymentPackageId) {
        return createOutreachCampaignFromDeployment(deploymentPackageId, payload)
      }
      if (!leadId) {
        throw new Error('Lead is required to start outreach.')
      }
      return createOutreachCampaignForLead(leadId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outreachKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() })
      toast.success('Outreach campaign started')
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error, 'Failed to start outreach campaign.'))
    },
  })
}
