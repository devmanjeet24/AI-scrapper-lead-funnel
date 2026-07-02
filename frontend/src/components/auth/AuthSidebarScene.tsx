import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, Radio, Send, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter'
import { cn } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

const workflowSteps = [
  { id: 'signals', label: 'Signals', icon: Radio },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'outreach', label: 'Outreach', icon: Send },
  { id: 'meetings', label: 'Meetings', icon: CalendarCheck },
] as const

const activityCards = [
  {
    id: 'signal',
    title: 'Signal Detected',
    detail: 'NovaTech · VP Sales role posted',
    meta: 'Score 92',
    icon: Radio,
    offset: 'translate-x-0',
  },
  {
    id: 'lead',
    title: 'Lead Qualified',
    detail: 'Sarah Chen · ICP match 94%',
    meta: 'Priority A',
    icon: Users,
    offset: 'translate-x-4 sm:translate-x-6',
  },
  {
    id: 'outreach',
    title: 'Outreach Running',
    detail: 'Sequence #24 · Email sent',
    meta: 'Day 1',
    icon: Send,
    offset: 'translate-x-1 sm:translate-x-2',
  },
  {
    id: 'meeting',
    title: 'Meeting Booked',
    detail: 'Tue 10:00 · Demo confirmed',
    meta: 'Calendar',
    icon: CalendarCheck,
    offset: 'translate-x-2 sm:translate-x-3',
  },
] as const

function GlassCounter({
  value,
  label,
  className,
}: {
  value: number
  label: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center rounded-xl border border-white/70',
        'bg-white/55 px-2 py-2 backdrop-blur-md',
        'shadow-[0_4px_20px_rgb(28_200_141/0.08),inset_0_1px_0_rgb(255_255_255/0.8)]',
        className,
      )}
    >
      <AnimatedCounter
        value={value}
        className="text-base font-bold tabular-nums text-primary sm:text-lg"
      />
      <span className="mt-0.5 text-center text-[8px] font-medium leading-tight text-muted sm:text-[9px]">
        {label}
      </span>
    </div>
  )
}

function ConnectionLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      viewBox="0 0 280 210"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="auth-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(28 200 141)" stopOpacity="0.15" />
          <stop offset="50%" stopColor="rgb(28 200 141)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="rgb(28 200 141)" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <motion.path
        d="M 52 24 C 52 48, 52 48, 52 68"
        fill="none"
        stroke="url(#auth-line-grad)"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1, strokeDashoffset: [0, -20] }}
        transition={{
          pathLength: { duration: 1.2, ease },
          opacity: { duration: 0.6 },
          strokeDashoffset: { duration: 3, repeat: Infinity, ease: 'linear' },
        }}
      />
      <motion.path
        d="M 52 68 C 100 68, 120 84, 148 96"
        fill="none"
        stroke="url(#auth-line-grad)"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1, strokeDashoffset: [0, -20] }}
        transition={{
          pathLength: { duration: 1.2, delay: 0.2, ease },
          opacity: { duration: 0.6, delay: 0.2 },
          strokeDashoffset: { duration: 3, repeat: Infinity, ease: 'linear', delay: 0.6 },
        }}
      />
      <motion.path
        d="M 148 96 C 148 118, 148 118, 148 138"
        fill="none"
        stroke="url(#auth-line-grad)"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1, strokeDashoffset: [0, -20] }}
        transition={{
          pathLength: { duration: 1.2, delay: 0.35, ease },
          opacity: { duration: 0.6, delay: 0.35 },
          strokeDashoffset: { duration: 3, repeat: Infinity, ease: 'linear', delay: 1.2 },
        }}
      />
      <motion.path
        d="M 148 138 C 180 138, 200 154, 228 172"
        fill="none"
        stroke="url(#auth-line-grad)"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1, strokeDashoffset: [0, -20] }}
        transition={{
          pathLength: { duration: 1.2, delay: 0.5, ease },
          opacity: { duration: 0.6, delay: 0.5 },
          strokeDashoffset: { duration: 3, repeat: Infinity, ease: 'linear', delay: 1.6 },
        }}
      />

      {[
        { cx: 52, cy: 24 },
        { cx: 52, cy: 68 },
        { cx: 148, cy: 96 },
        { cx: 148, cy: 138 },
        { cx: 228, cy: 172 },
      ].map((node, i) => (
        <motion.circle
          key={`${node.cx}-${node.cy}`}
          cx={node.cx}
          cy={node.cy}
          r="3"
          fill="rgb(28 200 141)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            scale: { duration: 2.5, repeat: Infinity, delay: i * 0.4 },
            opacity: { duration: 2.5, repeat: Infinity, delay: i * 0.4 },
          }}
        />
      ))}
    </svg>
  )
}

function ActivityCard({
  card,
  index,
  isActive,
}: {
  card: (typeof activityCards)[number]
  index: number
  isActive: boolean
}) {
  const Icon = card.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, x: -8 }}
      animate={{
        opacity: 1,
        y: isActive ? -2 : [0, -3, 0],
        x: 0,
      }}
      transition={{
        opacity: { delay: 0.2 + index * 0.1, duration: 0.45, ease },
        y: isActive
          ? { duration: 0.35, ease }
          : { duration: 4 + index * 0.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 },
        x: { delay: 0.2 + index * 0.1, duration: 0.45, ease },
      }}
      className={cn('relative w-[88%] max-w-[220px]', card.offset)}
    >
      <div
        className={cn(
          'rounded-xl border p-2.5 backdrop-blur-md transition-shadow duration-500',
          'bg-white/60 shadow-[0_8px_28px_rgb(45_45_45/0.05),inset_0_1px_0_rgb(255_255_255/0.85)]',
          isActive
            ? 'border-primary/30 shadow-[0_12px_36px_rgb(28_200_141/0.14)]'
            : 'border-white/70',
        )}
      >
        <div className="flex items-start gap-2">
          <div
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-lg',
              isActive ? 'bg-primary text-white' : 'bg-primary-soft text-primary',
            )}
          >
            <Icon className="size-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-semibold text-foreground">{card.title}</p>
              {isActive ? (
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
                  <span className="relative size-1.5 rounded-full bg-primary" />
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-[8px] text-muted">{card.detail}</p>
          </div>
          <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[7px] font-semibold text-primary">
            {card.meta}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function AuthSidebarScene({ className }: { className?: string }) {
  const [signals, setSignals] = useState(1284)
  const [campaigns, setCampaigns] = useState(24)
  const [meetings, setMeetings] = useState(18)
  const [activeStep, setActiveStep] = useState(0)
  const [activeCard, setActiveCard] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals((v) => v + Math.floor(Math.random() * 3))
      if (Math.random() > 0.6) setCampaigns((v) => v + 1)
      if (Math.random() > 0.75) setMeetings((v) => v + 1)
    }, 4200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % workflowSteps.length)
      setActiveCard((c) => (c + 1) % activityCards.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn('flex min-h-0 flex-col gap-3 py-1', className)}>
      <div className="flex gap-2">
        <GlassCounter value={signals} label="Signals Today" />
        <GlassCounter value={campaigns} label="Active Campaigns" />
        <GlassCounter value={meetings} label="Meetings Booked" />
      </div>

      <div
        className={cn(
          'rounded-xl border border-white/60 bg-white/40 px-3 py-2.5 backdrop-blur-sm',
          'shadow-[inset_0_1px_0_rgb(255_255_255/0.7)]',
        )}
      >
        <p className="mb-2 text-[9px] font-semibold tracking-wider text-primary uppercase">
          AI Workflow
        </p>
        <div className="flex items-center justify-between gap-1">
          {workflowSteps.map((step, i) => {
            const Icon = step.icon
            const isActive = i === activeStep
            const isPast = i < activeStep

            return (
              <div key={step.id} className="flex flex-1 items-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    opacity: isActive || isPast ? 1 : 0.55,
                  }}
                  transition={{ duration: 0.35, ease }}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      'flex size-7 items-center justify-center rounded-lg border transition-colors duration-300',
                      isActive
                        ? 'border-primary/30 bg-primary text-white shadow-[0_4px_14px_rgb(28_200_141/0.3)]'
                        : isPast
                          ? 'border-primary/20 bg-primary-soft text-primary'
                          : 'border-white/80 bg-white/70 text-muted',
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <span
                    className={cn(
                      'text-[7px] font-semibold sm:text-[8px]',
                      isActive ? 'text-primary' : 'text-muted',
                    )}
                  >
                    {step.label}
                  </span>
                </motion.div>

                {i < workflowSteps.length - 1 ? (
                  <div className="relative mx-0.5 h-px flex-1 overflow-hidden sm:mx-1">
                    <div className="absolute inset-0 bg-primary/10" />
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary/50"
                      animate={{ width: isPast || isActive ? '100%' : '0%' }}
                      transition={{ duration: 0.5, ease }}
                    />
                    <AnimatePresence>
                      {isActive ? (
                        <motion.div
                          className="absolute top-1/2 size-1 -translate-y-1/2 rounded-full bg-primary"
                          initial={{ left: '0%', opacity: 0 }}
                          animate={{ left: '100%', opacity: [0, 1, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        />
                      ) : null}
                    </AnimatePresence>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      <div className="relative min-h-[168px] flex-1 sm:min-h-[188px]">
        <ConnectionLines />

        <div className="relative flex flex-col gap-2.5 py-1">
          {activityCards.map((card, i) => (
            <ActivityCard key={card.id} card={card} index={i} isActive={i === activeCard} />
          ))}
        </div>

        <motion.div
          className="pointer-events-none absolute right-0 bottom-1 rounded-full border border-primary/15 bg-primary-soft/50 px-2 py-0.5 backdrop-blur-sm"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <span className="flex items-center gap-1 text-[8px] font-semibold text-primary">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
              <span className="relative size-1.5 rounded-full bg-primary" />
            </span>
            Live pipeline
          </span>
        </motion.div>
      </div>
    </div>
  )
}
