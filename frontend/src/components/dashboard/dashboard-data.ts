import type { LucideIcon } from 'lucide-react'
import {
  Bot,
  CalendarCheck,
  Mail,
  Palette,
  Radio,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'

export const KPI_METRICS = [
  { id: 'signals', label: 'Signals Found', value: 1284, delta: '+142 today', icon: Radio },
  { id: 'leads', label: 'Qualified Leads', value: 342, delta: '+38 today', icon: Users },
  { id: 'creatives', label: 'Creatives Generated', value: 298, delta: '+24 today', icon: Palette },
  { id: 'outreach', label: 'Active Outreach', value: 156, delta: '12 sequences', icon: Send },
  { id: 'meetings', label: 'Meetings Booked', value: 28, delta: '+5 this week', icon: CalendarCheck },
] as const

export const PIPELINE_STAGES = [
  { id: 'signals', label: 'Signals', count: 1284, icon: Radio },
  { id: 'leads', label: 'Leads', count: 342, icon: Users },
  { id: 'creatives', label: 'Creatives', count: 298, icon: Palette },
  { id: 'outreach', label: 'Outreach', count: 156, icon: Send },
  { id: 'meetings', label: 'Meetings', count: 28, icon: CalendarCheck },
] as const

export type ActivityType =
  | 'signal'
  | 'lead'
  | 'creative'
  | 'outreach'
  | 'meeting'

export interface ActivityEvent {
  id: string
  type: ActivityType
  label: string
  detail: string
  time: string
  icon: LucideIcon
}

export const ACTIVITY_POOL: Omit<ActivityEvent, 'id' | 'time'>[] = [
  {
    type: 'signal',
    label: 'Signal detected',
    detail: 'Series B funding at NovaTech',
    icon: Radio,
  },
  {
    type: 'lead',
    label: 'Lead qualified',
    detail: 'VP Sales — 94% ICP match',
    icon: Users,
  },
  {
    type: 'creative',
    label: 'Creative generated',
    detail: 'Personalized email for Growth Labs',
    icon: Sparkles,
  },
  {
    type: 'outreach',
    label: 'Outreach started',
    detail: 'Multi-channel sequence #24',
    icon: Mail,
  },
  {
    type: 'meeting',
    label: 'Meeting booked',
    detail: 'Demo with CloudSync — Thu 2pm',
    icon: CalendarCheck,
  },
  {
    type: 'signal',
    label: 'Signal detected',
    detail: 'VP Sales role posted at Apex AI',
    icon: Radio,
  },
  {
    type: 'creative',
    label: 'Creative generated',
    detail: 'LinkedIn DM variant for Marcus Webb',
    icon: Palette,
  },
  {
    type: 'outreach',
    label: 'Outreach started',
    detail: 'Follow-up wave — 18 contacts',
    icon: Send,
  },
]

export const AI_AGENTS = [
  {
    id: 'signal',
    name: 'Signal Agent',
    status: 'active' as const,
    task: 'Scanning 2,400 target domains',
    progress: 78,
    icon: Radio,
    throughput: '142 signals/hr',
  },
  {
    id: 'lead',
    name: 'Lead Agent',
    status: 'active' as const,
    task: 'Scoring 38 new prospects',
    progress: 64,
    icon: Users,
    throughput: '38 qualified/hr',
  },
  {
    id: 'creative',
    name: 'Creative Agent',
    status: 'active' as const,
    task: 'Generating personalized copy',
    progress: 52,
    icon: Palette,
    throughput: '24 assets/hr',
  },
  {
    id: 'outreach',
    name: 'Outreach Agent',
    status: 'active' as const,
    task: 'Running 12 live sequences',
    progress: 91,
    icon: Bot,
    throughput: '156 active sends',
  },
] as const

export const SIDEBAR_NAV = [
  { label: 'Mission Control', href: '/dashboard', icon: Sparkles, active: true },
  { label: 'Signals', href: '/signals', icon: Radio },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Outreach', href: '/outreach', icon: Send },
  { label: 'Appointments', href: '/appointments', icon: CalendarCheck },
] as const
