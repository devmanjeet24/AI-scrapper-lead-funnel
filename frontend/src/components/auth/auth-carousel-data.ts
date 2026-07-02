import {
  Calendar,
  CalendarCheck,
  Radio,
  Send,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

export interface AuthCarouselSlide {
  id: string
  eyebrow: string
  title: string
  description: string
  stat: { value: string; label: string }
  icon: LucideIcon
  previewKey: string
}

export const authCarouselSlides: AuthCarouselSlide[] = [
  {
    id: 'signals',
    eyebrow: 'Signal Detection',
    title: 'Catch buying intent before competitors do',
    description:
      'AI scans web, social, and review sources — surfacing hiring spikes, funding news, and pricing shifts as actionable signals.',
    stat: { value: '1,284', label: 'signals detected today' },
    icon: Radio,
    previewKey: 'signals',
  },
  {
    id: 'leads',
    eyebrow: 'Lead Qualification',
    title: 'Every prospect scored against your ICP',
    description:
      'High-intent signals graduate into ranked leads with priority tiers and AI vetting verdicts before reps get involved.',
    stat: { value: '94%', label: 'ICP match rate' },
    icon: Users,
    previewKey: 'leads',
  },
  {
    id: 'creatives',
    eyebrow: 'Creative Generation',
    title: 'Personalized copy for every account',
    description:
      'Generate headlines, ad variants, and campaign ideas tailored to each prospect’s context and buying signals.',
    stat: { value: '89', label: 'variants generated' },
    icon: Sparkles,
    previewKey: 'creatives',
  },
  {
    id: 'outreach',
    eyebrow: 'Outreach Automation',
    title: 'Multi-channel sequences on autopilot',
    description:
      'Email, SMS, and voice sequences draft themselves — referencing lead intelligence and deployment context at every touch.',
    stat: { value: '24', label: 'active sequences' },
    icon: Send,
    previewKey: 'outreach',
  },
  {
    id: 'meetings',
    eyebrow: 'Meeting Booking',
    title: 'From signal to scheduled demo',
    description:
      'The booking agent proposes optimal slots from conversation context and confirms appointments without manual coordination.',
    stat: { value: '18', label: 'booked this week' },
    icon: Calendar,
    previewKey: 'meetings',
  },
  {
    id: 'calendar',
    eyebrow: 'Google Calendar Integration',
    title: 'Real availability, zero back-and-forth',
    description:
      'Sync rep calendars for live slot matching — the agent reads open windows and books directly on Google Calendar.',
    stat: { value: '4', label: 'calendars connected' },
    icon: CalendarCheck,
    previewKey: 'calendar',
  },
]

export const previewTitles: Record<string, string> = {
  signals: 'Signal Detection',
  leads: 'Lead Qualification',
  creatives: 'Creative Studio',
  outreach: 'Outreach Sequences',
  meetings: 'Meeting Booking',
  calendar: 'Google Calendar',
}

export type PreviewComponent = () => ReactNode
