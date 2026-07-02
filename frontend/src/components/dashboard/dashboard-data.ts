import {
  Bot,
  CalendarCheck,
  Globe,
  Palette,
  Radio,
  Send,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'

export const KPI_DEFINITIONS = [
  { id: 'signals', label: 'Signals Found', icon: Radio },
  { id: 'leads', label: 'Qualified Leads', icon: Users },
  { id: 'creatives', label: 'Creatives Generated', icon: Palette },
  { id: 'outreach', label: 'Active Outreach', icon: Send },
  { id: 'meetings', label: 'Meetings Booked', icon: CalendarCheck },
] as const

export const PIPELINE_STAGE_DEFINITIONS = [
  { id: 'signals', label: 'Signals', icon: Radio },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'creatives', label: 'Creatives', icon: Palette },
  { id: 'outreach', label: 'Outreach', icon: Send },
  { id: 'meetings', label: 'Meetings', icon: CalendarCheck },
] as const

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
  { label: 'Scrape Jobs', href: '/scrape-jobs', icon: Globe },
  { label: 'Signals', href: '/signals', icon: Radio },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Outreach', href: '/outreach', icon: Send },
  { label: 'Appointments', href: '/appointments', icon: CalendarCheck },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const
