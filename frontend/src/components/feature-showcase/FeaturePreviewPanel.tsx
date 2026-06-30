import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  Bot,
  CalendarCheck,
  Check,
  Mail,
  MessageSquare,
  Radio,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { agentIcons, type Feature } from './feature-data'

const panelEase = [0.22, 1, 0.36, 1] as const

function PulseDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex size-1.5', className)}>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
      <span className="relative size-1.5 rounded-full bg-primary" />
    </span>
  )
}

function WindowChrome({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[1.25rem] border border-border/80',
        'bg-surface-solid shadow-[var(--shadow-float)]',
        'sm:rounded-[1.5rem]',
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/60 bg-section-alt/80 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="flex-1 text-center text-[11px] font-medium text-muted">{title}</span>
        <div className="flex items-center gap-1.5">
          <PulseDot />
          <span className="text-[10px] font-semibold text-primary uppercase">Live</span>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

function AgentStrip({ agents }: { agents: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">
        Active agents
      </span>
      {agents.map((agent) => {
        const Icon = agentIcons[agent] ?? Bot
        return (
          <span
            key={agent}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-[10px] font-semibold text-primary"
          >
            <Icon className="size-3" />
            {agent}
          </span>
        )
      })}
    </div>
  )
}

function SignalsPreview() {
  const rows = [
    { type: 'Hiring', company: 'NovaTech', signal: 'VP Sales role posted', score: 92, live: true },
    { type: 'News', company: 'Growth Labs', signal: 'Series B announced', score: 88, live: false },
    { type: 'Pricing', company: 'CloudSync', signal: 'Enterprise tier added', score: 76, live: false },
    { type: 'Mention', company: 'DataForge', signal: 'G2 review spike', score: 81, live: false },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Signal Feed</p>
          <p className="text-[11px] text-muted">Scanning 2,400 target domains</p>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary"
        >
          <Radio className="size-4" />
        </motion.div>
      </div>

      <div className="space-y-2">
        {rows.map((row, i) => (
          <motion.div
            key={row.company}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: panelEase }}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5',
              row.live
                ? 'border-primary/30 bg-primary-soft/60'
                : 'border-border/60 bg-section-alt/50',
            )}
          >
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
                row.live ? 'bg-primary text-white' : 'bg-surface-solid text-muted',
              )}
            >
              {row.score}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-xs font-semibold text-foreground">{row.company}</p>
                <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                  {row.type}
                </span>
              </div>
              <p className="truncate text-[10px] text-muted">{row.signal}</p>
            </div>
            {row.live ? <PulseDot className="shrink-0" /> : null}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="h-1 overflow-hidden rounded-full bg-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: ['20%', '85%', '20%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  )
}

function LeadsPreview() {
  const leads = [
    { name: 'Sarah Chen', role: 'VP Sales', company: 'NovaTech', score: 94, priority: 'High' },
    { name: 'Marcus Webb', role: 'Head of Growth', company: 'Growth Labs', score: 91, priority: 'High' },
    { name: 'Elena Ruiz', role: 'CMO', company: 'CloudSync', score: 87, priority: 'Medium' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Qualified Pipeline</p>
          <p className="text-[11px] text-muted">Vetting agent · 3 verdicts ready</p>
        </div>
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold text-primary">
          94% ICP
        </span>
      </div>

      <div className="space-y-2.5">
        {leads.map((lead, i) => (
          <motion.div
            key={lead.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.45, ease: panelEase }}
            className="rounded-xl border border-border/60 bg-section-alt/40 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Users className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{lead.name}</p>
                  <p className="text-[10px] text-muted">
                    {lead.role} · {lead.company}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold tabular-nums text-primary">{lead.score}</p>
                <p className="text-[9px] font-semibold text-muted uppercase">ICP score</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[9px] font-bold uppercase',
                  lead.priority === 'High'
                    ? 'bg-primary text-white'
                    : 'border border-border bg-surface-solid text-muted',
                )}
              >
                {lead.priority}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                <Check className="size-3" />
                Qualified
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CreativesPreview() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: panelEase }}
          className="rounded-xl border border-border/60 bg-section-alt/50 p-3"
        >
          <div className="mb-2 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-foreground">Creative Set</span>
          </div>
          <p className="text-xs font-semibold leading-snug text-foreground">
            Scale outbound without scaling headcount
          </p>
          <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-muted">
            NovaTech&apos;s Series B means they&apos;re investing in GTM — position your
            pipeline tool as the force multiplier their VP Sales needs now.
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {['Headline', 'Ad Copy', 'Campaign'].map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08, duration: 0.45, ease: panelEase }}
          className="rounded-xl border border-primary/25 bg-primary-soft/40 p-3"
        >
          <div className="mb-2 flex items-center gap-1.5">
            <Mail className="size-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-foreground">Outreach Draft</span>
          </div>
          <p className="text-[10px] font-medium text-muted">To: sarah@novatech.io</p>
          <p className="mt-1 text-xs font-semibold text-foreground">
            Re: Congrats on the Series B — quick idea for your GTM stack
          </p>
          <p className="mt-1.5 line-clamp-3 text-[10px] leading-relaxed text-muted">
            Saw the VP Sales hire and funding news — teams at your stage typically
            3× outbound volume in Q1. Happy to show how we automate that...
          </p>
        </motion.div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-solid px-3 py-2.5">
        <MessageSquare className="size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold text-foreground">Sequence #24 · Email + SMS</p>
          <p className="text-[10px] text-muted">3 touches scheduled · NovaTech account</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-white uppercase">
          Running
        </span>
      </div>

      <motion.div
        className="flex items-center gap-2 text-[10px] text-muted"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <Send className="size-3 text-primary" />
        Outreach agent drafting follow-up #2...
      </motion.div>
    </div>
  )
}

function MeetingsPreview() {
  const slots = [
    { day: 'Tue', time: '10:00 AM', lead: 'Sarah Chen', status: 'confirmed' },
    { day: 'Wed', time: '2:30 PM', lead: 'Marcus Webb', status: 'confirmed' },
    { day: 'Thu', time: '11:00 AM', lead: 'Elena Ruiz', status: 'proposed' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-soft">
            <CalendarCheck className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Google Calendar</p>
            <p className="text-[10px] text-muted">Rep availability synced</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-soft px-2 py-0.5 text-[9px] font-semibold text-primary">
          <Check className="size-3" />
          Connected
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span
            key={`${d}-${i}`}
            className={cn(
              'rounded-lg py-1.5 text-[10px] font-semibold',
              i === 1 || i === 2 || i === 3
                ? 'bg-primary text-white'
                : 'text-muted',
            )}
          >
            {d}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {slots.map((slot, i) => (
          <motion.div
            key={`${slot.day}-${slot.time}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: panelEase }}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5',
              slot.status === 'confirmed'
                ? 'border-primary/30 bg-primary-soft/50'
                : 'border-dashed border-border bg-section-alt/30',
            )}
          >
            <div className="text-center">
              <p className="text-[10px] font-bold text-primary">{slot.day}</p>
              <p className="text-[10px] font-semibold text-foreground">{slot.time}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                Demo · {slot.lead}
              </p>
              <p className="text-[10px] text-muted">
                {slot.status === 'confirmed' ? 'Confirmed on calendar' : 'Slot proposed by agent'}
              </p>
            </div>
            {slot.status === 'confirmed' ? (
              <Check className="size-4 shrink-0 text-primary" />
            ) : (
              <ArrowUpRight className="size-4 shrink-0 text-muted" />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary-soft to-transparent px-3 py-2.5"
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <p className="text-[10px] font-semibold text-primary">Booking agent active</p>
        <p className="text-[10px] text-muted">
          Reading transcript → matching 3 open slots → drafting confirmation
        </p>
      </motion.div>
    </div>
  )
}

const previewTitles: Record<string, string> = {
  signals: 'Signal Detection — Command Center',
  leads: 'Lead Qualification — Pipeline',
  creatives: 'Creatives & Outreach — Studio',
  meetings: 'Meeting Booking — Calendar',
}

const previewComponents: Record<string, () => ReactNode> = {
  signals: SignalsPreview,
  leads: LeadsPreview,
  creatives: CreativesPreview,
  meetings: MeetingsPreview,
}

interface FeaturePreviewPanelProps {
  feature: Feature
  className?: string
}

export function FeaturePreviewPanel({ feature, className }: FeaturePreviewPanelProps) {
  const Preview = previewComponents[feature.id]

  return (
    <div className={cn('relative', className)}>
      <div
        className="pointer-events-none absolute -inset-6 rounded-[2rem] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgb(28 200 141 / 0.12), transparent 70%)',
        }}
      />

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.5, ease: panelEase }}
          >
            <WindowChrome title={previewTitles[feature.id] ?? 'Product Preview'}>
              <Preview />
              <div className="mt-4 border-t border-border/50 pt-4">
                <AgentStrip agents={feature.agents} />
              </div>
            </WindowChrome>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
