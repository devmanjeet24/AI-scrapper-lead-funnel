import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Workflow } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'
import { ZigZagWorkflow } from '@/components/social-proof/ZigZagWorkflow'

interface StatCardData {
  id: string
  label: string
  value: number
  suffix?: string
  delta: string
}

const stats: StatCardData[] = [
  { id: 'signals', label: 'Signals', value: 1284, delta: '+142 today' },
  { id: 'leads', label: 'Leads', value: 312, delta: '94% ICP match' },
  { id: 'outreach', label: 'Outreach', value: 89, delta: '12 sequences live' },
  { id: 'meetings', label: 'Meetings', value: 24, delta: '+6 this week' },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
}

function AnimatedCounter({
  value,
  suffix = '',
}: {
  value: number
  suffix?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-20px' })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 60, damping: 18 })
  const display = useTransform(spring, (v) =>
    Math.round(v).toLocaleString(),
  )

  useEffect(() => {
    if (isInView) motionValue.set(value)
  }, [isInView, motionValue, value])

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  )
}

function StatCard({ stat, index }: { stat: StatCardData; index: number }) {
  return (
    <motion.article
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: index * 0.06 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border',
        'bg-surface-solid p-6 sm:p-7',
        'shadow-[0_4px_24px_rgb(45_45_45/0.04)]',
        'transition-shadow duration-300 hover:shadow-[0_12px_40px_rgb(28_200_141/0.1)]',
      )}
    >
      <div className="absolute -right-6 -top-6 size-24 rotate-12 bg-primary/5" />

      <p className="text-sm font-medium text-muted">{stat.label}</p>
      <p className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
      </p>
      <p className="mt-2 text-xs font-medium text-primary">{stat.delta}</p>
    </motion.article>
  )
}

function SlantedBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-[420px] rotate-[18deg] opacity-60"
        style={{
          background:
            'linear-gradient(135deg, rgb(28 200 141 / 0.08) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-[380px] -rotate-[12deg] opacity-50"
        style={{
          background:
            'linear-gradient(225deg, rgb(28 200 141 / 0.1) 0%, transparent 65%)',
        }}
      />
    </>
  )
}

export function SocialProofSection() {
  return (
    <section
      id="workflow"
      className={cn(
        'relative rounded-[28px] border border-border/60',
        'bg-section-alt shadow-[var(--shadow-soft)] sm:rounded-[32px] lg:rounded-[40px]',
      )}
    >
      <SlantedBackground />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 85% 15%, rgb(28 200 141 / 0.07), transparent 55%),
            radial-gradient(ellipse 60% 45% at 10% 80%, rgb(28 200 141 / 0.06), transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 px-4 pt-8 pb-8 sm:px-8 sm:pt-10 sm:pb-10 lg:px-10">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full border border-border',
              'bg-surface/90 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-primary uppercase backdrop-blur-sm',
            )}
          >
            <Workflow className="size-3.5" />
            AI Workflow
          </span>

          <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-[1.1]">
            From Signals to Meetings
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">
            AI agents detect intent, qualify leads, generate outreach, and book
            meetings — end to end, without manual handoffs.
          </p>
        </motion.div>

        <div className="-mx-4 overflow-x-hidden sm:-mx-8 lg:-mx-10">
          <ZigZagWorkflow>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <StatCard key={stat.id} stat={stat} index={index} />
              ))}
            </div>
          </ZigZagWorkflow>
        </div>
      </div>
    </section>
  )
}
