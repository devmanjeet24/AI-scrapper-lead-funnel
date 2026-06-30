import {
  Calendar,
  Radio,
  Send,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface FeatureBullet {
  label: string
  detail: string
}

export interface FeatureMetric {
  value: string
  label: string
}

export interface Feature {
  id: string
  step: string
  eyebrow: string
  title: string
  description: string
  bullets: FeatureBullet[]
  metrics: FeatureMetric[]
  agents: string[]
  icon: LucideIcon
}

export const features: Feature[] = [
  {
    id: 'signals',
    step: '01',
    eyebrow: 'Signal Detection',
    title: 'Surface buying intent across every source',
    description:
      'Groq-powered page analysis scans web, social, competitor, and review sources — extracting hiring spikes, funding news, pricing shifts, and competitor intel as structured signals your team can act on.',
    bullets: [
      {
        label: 'Multi-source scraping',
        detail: 'Web, social, competitor & review targets',
      },
      {
        label: 'AI page analysis',
        detail: 'Headlines, metadata & visible text parsed',
      },
      {
        label: 'Typed intent signals',
        detail: 'Hiring, news, pricing & mention detection',
      },
    ],
    metrics: [
      { value: '1,284', label: 'signals today' },
      { value: '6', label: 'source types' },
    ],
    agents: ['Page Analyzer'],
    icon: Radio,
  },
  {
    id: 'leads',
    step: '02',
    eyebrow: 'Lead Qualification',
    title: 'Convert signals into ranked, ICP-matched leads',
    description:
      'High-intent signals graduate into scored leads with priority tiers. The outreach agent vets every conversation — surfacing buying signals, qualification verdicts, and handoff recommendations before a rep ever gets involved.',
    bullets: [
      {
        label: 'ICP scoring',
        detail: 'Lead score & priority on every prospect',
      },
      {
        label: 'Signal → lead pipeline',
        detail: 'One-click conversion with full context',
      },
      {
        label: 'AI vetting agent',
        detail: 'Qualified, needs info, or handoff verdicts',
      },
    ],
    metrics: [
      { value: '94%', label: 'ICP match rate' },
      { value: '312', label: 'qualified leads' },
    ],
    agents: ['Vetting Agent'],
    icon: Users,
  },
  {
    id: 'creatives',
    step: '03',
    eyebrow: 'Creative Generation & Outreach',
    title: 'Personalized copy at scale, channel by channel',
    description:
      'Creative agents generate headlines, ad copy, and campaign ideas tailored to each account. Outreach agents draft email, SMS, and voice sequences — referencing deployment context and lead intelligence for every touchpoint.',
    bullets: [
      {
        label: 'Per-account creatives',
        detail: 'Headlines, ad copy & campaign ideas',
      },
      {
        label: 'Multi-channel outreach',
        detail: 'Email, SMS, voice & internal sequences',
      },
      {
        label: 'Context-aware drafts',
        detail: 'Lead score, ICP & deployment data woven in',
      },
    ],
    metrics: [
      { value: '89', label: 'variants live' },
      { value: '24', label: 'active sequences' },
    ],
    agents: ['Creative Agent', 'Outreach Agent'],
    icon: Sparkles,
  },
  {
    id: 'meetings',
    step: '04',
    eyebrow: 'Meeting Booking',
    title: 'Book demos directly on rep calendars',
    description:
      'The booking agent reads live Google Calendar availability, proposes optimal slots from conversation context, and confirms appointments — closing the loop from first signal to scheduled meeting without manual coordination.',
    bullets: [
      {
        label: 'Google Calendar sync',
        detail: 'Real availability from connected calendars',
      },
      {
        label: 'AI slot proposals',
        detail: 'Context-aware scheduling from transcripts',
      },
      {
        label: 'End-to-end handoff',
        detail: 'Qualified leads → confirmed appointments',
      },
    ],
    metrics: [
      { value: '18', label: 'booked this week' },
      { value: '4', label: 'agents collaborating' },
    ],
    agents: ['Booking Agent'],
    icon: Calendar,
  },
]

export const agentIcons: Record<string, LucideIcon> = {
  'Page Analyzer': Radio,
  'Vetting Agent': Users,
  'Creative Agent': Sparkles,
  'Outreach Agent': Send,
  'Booking Agent': Calendar,
}
