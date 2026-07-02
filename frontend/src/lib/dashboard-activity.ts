import type { Appointment } from '@/types/appointment'
import type { CreativeAsset } from '@/types/creative'
import type { DashboardActivityEvent } from '@/types/dashboard'
import type { Lead } from '@/types/lead'
import type { OutreachCampaign } from '@/types/outreach'
import type { Signal } from '@/types/signal'

function signalEvent(signal: Signal): DashboardActivityEvent {
  return {
    id: `signal-${signal.id}`,
    type: 'signal',
    label: 'Signal detected',
    detail: signal.title,
    created_at: signal.created_at,
  }
}

function leadEvent(lead: Lead): DashboardActivityEvent {
  const scoreSuffix =
    lead.lead_score !== null && lead.lead_score !== undefined
      ? ` · score ${lead.lead_score}`
      : ''

  return {
    id: `lead-${lead.id}`,
    type: 'lead',
    label: 'Lead created',
    detail: `${lead.title}${scoreSuffix}`,
    created_at: lead.created_at,
  }
}

function creativeEvent(asset: CreativeAsset): DashboardActivityEvent {
  const detail =
    asset.title?.trim() ||
    asset.body_text?.trim() ||
    `${asset.asset_type.replace(/_/g, ' ')} asset`

  return {
    id: `creative-${asset.id}`,
    type: 'creative',
    label: 'Creative generated',
    detail,
    created_at: asset.created_at,
  }
}

function outreachEvent(campaign: OutreachCampaign): DashboardActivityEvent {
  const detail =
    campaign.subject?.trim() ||
    `${campaign.channel.replace(/_/g, ' ')} campaign · ${campaign.status}`

  return {
    id: `outreach-${campaign.id}`,
    type: 'outreach',
    label: 'Outreach campaign started',
    detail,
    created_at: campaign.created_at,
  }
}

function appointmentEvent(appointment: Appointment): DashboardActivityEvent {
  const when = new Date(appointment.starts_at).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return {
    id: `meeting-${appointment.id}`,
    type: 'meeting',
    label: 'Appointment booked',
    detail: `${appointment.title} · ${when}`,
    created_at: appointment.created_at,
  }
}

export function buildDashboardActivityEvents(input: {
  signals: Signal[]
  leads: Lead[]
  creatives: CreativeAsset[]
  outreach: OutreachCampaign[]
  appointments: Appointment[]
  limit?: number
}): DashboardActivityEvent[] {
  const events: DashboardActivityEvent[] = [
    ...input.signals.map(signalEvent),
    ...input.leads.map(leadEvent),
    ...input.creatives.map(creativeEvent),
    ...input.outreach.map(outreachEvent),
    ...input.appointments.map(appointmentEvent),
  ]

  return events
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, input.limit ?? 50)
}
