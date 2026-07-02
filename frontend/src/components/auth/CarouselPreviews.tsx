import { motion } from 'framer-motion'
import {
  Bot,
  CalendarCheck,
  Check,
  Mail,
  MessageSquare,
  Radio,
  Send,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { DashboardScene, FloatingCard, LiveBadge, MetricPill } from './DashboardScene'

const ease = [0.22, 1, 0.36, 1] as const

export function SignalsPreview() {
  const rows = [
    { type: 'Hiring', company: 'NovaTech', signal: 'VP Sales role posted', score: 92, live: true },
    { type: 'News', company: 'Growth Labs', signal: 'Series B announced', score: 88 },
    { type: 'Pricing', company: 'CloudSync', signal: 'Enterprise tier added', score: 76 },
  ]

  return (
    <DashboardScene>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <MetricPill value="1,284" label="signals today" />
          <MetricPill value="6" label="sources" />
        </div>
        <LiveBadge />
      </div>

      <FloatingCard delay={0.05}>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Radio className="size-3.5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-foreground">Signal feed</p>
              <p className="text-[9px] text-muted">Scanning 2,400 domains</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="size-5 rounded-full border border-primary/20 border-t-primary"
          />
        </div>
        <div className="space-y-1.5">
          {rows.map((row, i) => (
            <motion.div
              key={row.company}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35, ease }}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5',
                row.live ? 'bg-primary-soft/50' : 'bg-section-alt/50',
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-md text-[9px] font-bold',
                  row.live ? 'bg-primary text-white' : 'bg-white text-muted',
                )}
              >
                {row.score}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold text-foreground">{row.company}</p>
                <p className="truncate text-[8px] text-muted">{row.signal}</p>
              </div>
              <span className="rounded bg-primary/10 px-1 py-0.5 text-[7px] font-semibold text-primary">
                {row.type}
              </span>
            </motion.div>
          ))}
        </div>
      </FloatingCard>

      <FloatingCard delay={0.15} float className="flex items-center gap-2">
        <Bot className="size-3.5 text-primary" />
        <p className="text-[9px] text-muted">
          <span className="font-semibold text-primary">Page Analyzer</span> · 3 new high-intent signals
        </p>
      </FloatingCard>
    </DashboardScene>
  )
}

export function LeadsPreview() {
  const leads = [
    { name: 'Sarah Chen', role: 'VP Sales', score: 94 },
    { name: 'Marcus Webb', role: 'Head of Growth', score: 91 },
  ]

  return (
    <DashboardScene>
      <div className="flex gap-2">
        <MetricPill value="94%" label="ICP match" />
        <MetricPill value="312" label="qualified" />
      </div>

      <FloatingCard delay={0.05}>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold text-foreground">Qualified pipeline</p>
          <span className="flex items-center gap-1 text-[9px] font-medium text-primary">
            <TrendingUp className="size-3" />
            +18%
          </span>
        </div>
        <div className="space-y-1.5">
          {leads.map((lead, i) => (
            <motion.div
              key={lead.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.35, ease }}
              className="flex items-center gap-2 rounded-lg bg-section-alt/50 px-2 py-1.5"
            >
              <div className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Users className="size-3" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-foreground">{lead.name}</p>
                <p className="text-[8px] text-muted">{lead.role}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold tabular-nums text-primary">{lead.score}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </FloatingCard>

      <FloatingCard delay={0.12} float className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Check className="size-3 text-primary" />
          <span className="text-[9px] font-semibold text-foreground">Vetting agent verdict</span>
        </div>
        <span className="rounded-full bg-primary px-2 py-0.5 text-[8px] font-bold text-white">Qualified</span>
      </FloatingCard>
    </DashboardScene>
  )
}

export function CreativesPreview() {
  return (
    <DashboardScene>
      <div className="flex gap-2">
        <MetricPill value="89" label="variants" />
        <MetricPill value="12" label="accounts" />
      </div>

      <FloatingCard delay={0.05}>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-foreground">Creative set · NovaTech</span>
        </div>
        <p className="text-[11px] font-semibold leading-snug text-foreground">
          Scale outbound without scaling headcount
        </p>
        <p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-muted">
          Series B GTM investment — position your pipeline tool as the force multiplier their VP Sales
          needs now.
        </p>
        <div className="mt-2 flex gap-1">
          {['Headline', 'Ad Copy', 'Campaign'].map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[8px] font-semibold text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      </FloatingCard>

      <FloatingCard delay={0.12} float>
        <p className="text-[9px] font-medium text-muted">Variant B · generating</p>
        <motion.p
          className="mt-0.5 text-[11px] font-semibold text-foreground"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          Turn signals into pipeline in 48 hours
        </motion.p>
      </FloatingCard>
    </DashboardScene>
  )
}

export function OutreachPreview() {
  const steps = [
    { channel: 'Email', status: 'Sent', day: 'Day 1' },
    { channel: 'SMS', status: 'Scheduled', day: 'Day 3' },
    { channel: 'Voice', status: 'Draft', day: 'Day 5' },
  ]

  return (
    <DashboardScene>
      <div className="flex items-center justify-between">
        <MetricPill value="24" label="sequences" />
        <LiveBadge label="Running" />
      </div>

      <FloatingCard delay={0.05}>
        <p className="mb-2 text-[11px] font-semibold text-foreground">Sequence #24 · NovaTech</p>
        <div className="space-y-1.5">
          {steps.map((step, i) => (
            <motion.div
              key={step.channel}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35, ease }}
              className="flex items-center gap-2 rounded-lg bg-section-alt/50 px-2 py-1.5"
            >
              <div className="flex size-6 items-center justify-center rounded-md bg-primary-soft text-primary">
                {step.channel === 'Email' ? (
                  <Mail className="size-3" />
                ) : step.channel === 'SMS' ? (
                  <MessageSquare className="size-3" />
                ) : (
                  <Send className="size-3" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-foreground">{step.channel}</p>
                <p className="text-[8px] text-muted">{step.day}</p>
              </div>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase',
                  step.status === 'Sent' ? 'bg-primary text-white' : 'border border-border text-muted',
                )}
              >
                {step.status}
              </span>
            </motion.div>
          ))}
        </div>
      </FloatingCard>

      <FloatingCard delay={0.14} float className="flex items-center gap-1.5">
        <Send className="size-3 text-primary" />
        <motion.span
          className="text-[9px] text-muted"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          Outreach agent drafting follow-up #2...
        </motion.span>
      </FloatingCard>
    </DashboardScene>
  )
}

export function MeetingsPreview() {
  const slots = [
    { day: 'Tue', time: '10:00', lead: 'Sarah Chen', confirmed: true },
    { day: 'Wed', time: '14:30', lead: 'Marcus Webb', confirmed: true },
    { day: 'Thu', time: '11:00', lead: 'Elena Ruiz', confirmed: false },
  ]

  return (
    <DashboardScene>
      <MetricPill value="18" label="booked this week" />

      <FloatingCard delay={0.05}>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary-soft">
            <CalendarCheck className="size-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-foreground">Upcoming demos</p>
            <p className="text-[9px] text-muted">Booking agent active</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {slots.map((slot, i) => (
            <motion.div
              key={`${slot.day}-${slot.time}`}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.35, ease }}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5',
                slot.confirmed ? 'bg-primary-soft/40' : 'border border-dashed border-border/80',
              )}
            >
              <div className="text-center">
                <p className="text-[8px] font-bold text-primary">{slot.day}</p>
                <p className="text-[8px] font-semibold text-foreground">{slot.time}</p>
              </div>
              <p className="min-w-0 flex-1 truncate text-[10px] font-semibold text-foreground">
                {slot.lead}
              </p>
              {slot.confirmed ? <Check className="size-3 shrink-0 text-primary" /> : null}
            </motion.div>
          ))}
        </div>
      </FloatingCard>
    </DashboardScene>
  )
}

export function CalendarPreview() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const reps = [
    { name: 'Alex R.', slots: 4 },
    { name: 'Jordan K.', slots: 6 },
    { name: 'Sam T.', slots: 3 },
  ]

  return (
    <DashboardScene>
      <div className="flex items-center justify-between">
        <MetricPill value="4" label="calendars" />
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary-soft/50 px-2 py-0.5 text-[8px] font-semibold text-primary">
          <Check className="size-2.5" />
          Synced
        </span>
      </div>

      <FloatingCard delay={0.05}>
        <p className="mb-2 text-[11px] font-semibold text-foreground">Google Calendar</p>
        <div className="mb-2.5 grid grid-cols-7 gap-0.5 text-center">
          {days.map((d, i) => (
            <span
              key={`${d}-${i}`}
              className={cn(
                'rounded-md py-1 text-[8px] font-semibold',
                i >= 1 && i <= 3 ? 'bg-primary text-white' : 'text-muted',
              )}
            >
              {d}
            </span>
          ))}
        </div>
        <div className="space-y-1">
          {reps.map((rep, i) => (
            <motion.div
              key={rep.name}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35, ease }}
              className="flex items-center justify-between rounded-lg bg-section-alt/50 px-2 py-1.5"
            >
              <p className="text-[10px] font-semibold text-foreground">{rep.name}</p>
              <span className="text-[8px] text-muted">{rep.slots} open slots</span>
            </motion.div>
          ))}
        </div>
      </FloatingCard>

      <FloatingCard delay={0.12} float className="flex items-center gap-1.5">
        <Bot className="size-3 text-primary" />
        <span className="text-[9px] text-muted">Matching availability across 3 reps...</span>
      </FloatingCard>
    </DashboardScene>
  )
}

export const carouselPreviews: Record<string, () => React.ReactNode> = {
  signals: SignalsPreview,
  leads: LeadsPreview,
  creatives: CreativesPreview,
  outreach: OutreachPreview,
  meetings: MeetingsPreview,
  calendar: CalendarPreview,
}
