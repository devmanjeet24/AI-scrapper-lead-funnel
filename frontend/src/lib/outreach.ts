import type { Lead } from '@/types/lead'
import type {
  OutreachCampaign,
  OutreachCampaignSortField,
  OutreachConversation,
  QualificationVerdict,
  SortDirection,
  VettingInsights,
  VettingResponse,
} from '@/types/outreach'

export { PAGE_SIZE, SEARCH_FETCH_LIMIT } from '@/lib/leads'

export const OUTREACH_CAMPAIGN_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const

export const OUTREACH_CHANNEL_OPTIONS = [
  { value: 'internal', label: 'Internal (in-app)' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'voice', label: 'Voice' },
] as const

const STATUS_ORDER: Record<string, number> = {
  active: 1,
  draft: 2,
  paused: 3,
  completed: 4,
  failed: 5,
}

function compareNullableStrings(a: string | null | undefined, b: string | null | undefined) {
  const left = (a ?? '').toLowerCase()
  const right = (b ?? '').toLowerCase()
  return left.localeCompare(right)
}

export function getOutreachDraftMessage(campaign: OutreachCampaign): string | null {
  const draft = campaign.agent_metadata.outreach_draft
  if (!draft || typeof draft !== 'object') return null
  const message = (draft as { message?: unknown }).message
  return typeof message === 'string' && message.trim() ? message.trim() : null
}

export function getCampaignDisplaySubject(campaign: OutreachCampaign): string {
  if (campaign.subject?.trim()) return campaign.subject.trim()
  const draft = campaign.agent_metadata.outreach_draft
  if (draft && typeof draft === 'object') {
    const subject = (draft as { subject?: unknown }).subject
    if (typeof subject === 'string' && subject.trim()) return subject.trim()
  }
  return 'Outreach campaign'
}

export function filterCampaignsBySearch(
  campaigns: OutreachCampaign[],
  query: string,
  leadMap: Map<string, Lead>,
): OutreachCampaign[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return campaigns

  return campaigns.filter((campaign) => {
    const lead = leadMap.get(campaign.lead_id)
    const haystack = [
      getCampaignDisplaySubject(campaign),
      campaign.channel,
      campaign.status,
      campaign.recipient_email,
      lead?.title,
      lead?.source_label,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalized)
  })
}

export function sortOutreachCampaigns(
  campaigns: OutreachCampaign[],
  field: OutreachCampaignSortField,
  direction: SortDirection,
): OutreachCampaign[] {
  const sorted = [...campaigns].sort((a, b) => {
    let result = 0

    switch (field) {
      case 'subject':
        result = compareNullableStrings(
          getCampaignDisplaySubject(a),
          getCampaignDisplaySubject(b),
        )
        break
      case 'channel':
        result = compareNullableStrings(a.channel, b.channel)
        break
      case 'status':
        result = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
        break
      case 'created_at':
        result = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
    }

    return direction === 'asc' ? result : -result
  })

  return sorted
}

export function canReplyToConversation(conversation: OutreachConversation): boolean {
  return conversation.status === 'open' || conversation.status === 'qualified'
}

export function canBookAppointment(conversation: OutreachConversation): boolean {
  return conversation.status === 'qualified' || conversation.status === 'handoff'
}

export function formatQualificationVerdict(verdict: QualificationVerdict): string {
  return verdict.replace(/_/g, ' ')
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

export function getVettingInsights(
  conversation: OutreachConversation | null | undefined,
  vettingResult?: VettingResponse | null,
): VettingInsights | null {
  if (!conversation && !vettingResult) return null

  if (vettingResult) {
    return {
      qualification_score: vettingResult.qualification_score,
      qualification_verdict: vettingResult.qualification_verdict,
      summary: vettingResult.summary,
      recommended_next_step: vettingResult.recommended_next_step,
      buying_signals: vettingResult.buying_signals,
      red_flags: vettingResult.red_flags,
    }
  }

  if (!conversation) return null

  const stored = conversation.vetting_result ?? {}
  return {
    qualification_score: conversation.qualification_score,
    qualification_verdict: conversation.qualification_verdict,
    summary: conversation.summary,
    recommended_next_step:
      typeof stored.recommended_next_step === 'string' ? stored.recommended_next_step : null,
    buying_signals: asStringArray(stored.buying_signals),
    red_flags: asStringArray(stored.red_flags),
  }
}

export function hasVettingInsights(insights: VettingInsights | null): boolean {
  if (!insights) return false
  return Boolean(
    insights.qualification_verdict ||
      insights.summary ||
      insights.recommended_next_step ||
      insights.buying_signals.length > 0 ||
      insights.red_flags.length > 0 ||
      insights.qualification_score !== null,
  )
}
