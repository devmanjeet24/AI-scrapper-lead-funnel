import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import {
  Bot,
  CalendarCheck,
  Mail,
  Radio,
  Send,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'

import heroVideo from '@/assets/videos/17356135-uhd_1920_1440_60fps.mp4'
import { useHeroInteraction } from '@/components/hero/HeroInteractionContext'
import { cn } from '@/lib/utils'

type ActivityIcon = typeof Radio

interface Activity {
  id: string
  label: string
  detail: string
  icon: ActivityIcon
}

const ACTIVITY_POOL: Omit<Activity, 'id'>[] = [
  {
    label: 'Signal Detected',
    detail: 'Series B funding at NovaTech',
    icon: Radio,
  },
  {
    label: 'Lead Qualified',
    detail: 'VP Sales — 94% ICP match',
    icon: Users,
  },
  {
    label: 'Outreach Running',
    detail: 'Multi-channel sequence #24',
    icon: Send,
  },
  {
    label: 'Email Sent',
    detail: 'Personalized follow-up delivered',
    icon: Mail,
  },
  {
    label: 'Meeting Booked',
    detail: 'Demo scheduled with Growth Labs',
    icon: CalendarCheck,
  },
  {
    label: 'AI Agent Active',
    detail: 'Scanning 2,400 target domains',
    icon: Bot,
  },
]

const FLOAT_SLOTS = [
  { top: '14%', left: '6%' },
  { top: '48%', left: '4%' },
  { top: '68%', left: '12%' },
] as const

const tiltSpring = { damping: 28, stiffness: 140, mass: 0.8 }
const floatTransition = {
  duration: 6,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  ease: 'easeInOut' as const,
}

let activityCounter = 0

function createActivity(source: (typeof ACTIVITY_POOL)[number]): Activity {
  activityCounter += 1
  return { ...source, id: `activity-${activityCounter}` }
}

function PulseDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative flex size-2', className)}>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
      <span className="relative size-2 rounded-full bg-primary" />
    </span>
  )
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft px-2.5 py-1 text-[10px] font-semibold tracking-wider text-primary uppercase">
      <PulseDot />
      Live
    </span>
  )
}

function GlassCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface/85 backdrop-blur-md',
        'shadow-[var(--shadow-float)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

function ActivityRow({ activity }: { activity: Activity }) {
  const Icon = activity.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-2.5 border-b border-border/80 py-2.5 last:border-0 last:pb-0"
    >
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground">{activity.label}</p>
        <p className="truncate text-[10px] text-muted">{activity.detail}</p>
      </div>
      <PulseDot className="mt-1 shrink-0 opacity-80" />
    </motion.div>
  )
}

function FloatingToast({
  activity,
  slot,
}: {
  activity: Activity
  slot: (typeof FLOAT_SLOTS)[number]
}) {
  const Icon = activity.icon

  return (
    <motion.div
      key={activity.id}
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute z-20 max-w-[200px] sm:max-w-[220px]"
      style={slot}
    >
      <GlassCard className="p-3 shadow-[0_0_32px_rgb(28_200_141/0.15)]">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-white shadow-[0_0_20px_rgb(28_200_141/0.35)]">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{activity.label}</p>
            <p className="truncate text-[10px] text-muted">{activity.detail}</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function useParallaxOffset(
  parallaxX: MotionValue<number>,
  parallaxY: MotionValue<number>,
  strengthX: number,
  strengthY: number,
) {
  const x = useTransform(parallaxX, [0, 1], [-strengthX, strengthX])
  const y = useTransform(parallaxY, [0, 1], [-strengthY, strengthY])
  return { x, y }
}

function useActivityStream() {
  const [feed, setFeed] = useState<Activity[]>(() => [
    createActivity(ACTIVITY_POOL[0]),
    createActivity(ACTIVITY_POOL[1]),
  ])
  const [floating, setFloating] = useState<Activity | null>(null)
  const [slotIndex, setSlotIndex] = useState(0)
  const poolIndex = useRef(2)

  useEffect(() => {
    const interval = window.setInterval(() => {
      const source = ACTIVITY_POOL[poolIndex.current % ACTIVITY_POOL.length]
      poolIndex.current += 1
      const next = createActivity(source)

      setFeed((prev) => [next, ...prev].slice(0, 5))
      setFloating(next)
      setSlotIndex((prev) => (prev + 1) % FLOAT_SLOTS.length)
    }, 3000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!floating) return
    const timeout = window.setTimeout(() => setFloating(null), 2600)
    return () => window.clearTimeout(timeout)
  }, [floating])

  return { feed, floating, slotIndex }
}

export function HeroVideoCommandCenter() {
  const { parallaxX, parallaxY } = useHeroInteraction()
  const { feed, floating, slotIndex } = useActivityStream()

  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const smoothTiltX = useSpring(tiltX, tiltSpring)
  const smoothTiltY = useSpring(tiltY, tiltSpring)
  const parallax = useParallaxOffset(parallaxX, parallaxY, 6, 4)

  const handleMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      tiltY.set(x * 6)
      tiltX.set(-y * 4)
    },
    [tiltX, tiltY],
  )

  const handleLeave = useCallback(() => {
    tiltX.set(0)
    tiltY.set(0)
  }, [tiltX, tiltY])

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[540px] lg:max-w-none"
      style={{ x: parallax.x, y: parallax.y }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <motion.div
        style={{
          rotateX: smoothTiltX,
          rotateY: smoothTiltY,
          transformPerspective: 1200,
          transformStyle: 'preserve-3d',
        }}
        animate={{ y: [-3, 3] }}
        transition={{ ...floatTransition, duration: 8 }}
        className={cn(
          'relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)]',
          'border border-border/80 shadow-[var(--shadow-soft)] will-change-transform',
          'sm:rounded-[1.75rem] lg:rounded-[2rem]',
        )}
      >
        <video
          className="absolute inset-0 size-full object-cover"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />

        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(160deg, rgb(45 45 45 / 0.45) 0%, rgb(45 45 45 / 0.2) 40%, rgb(28 200 141 / 0.18) 100%),
              linear-gradient(to top, rgb(235 244 240 / 0.85) 0%, transparent 45%)
            `,
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-primary/5" />

        <motion.div
          className="pointer-events-none absolute -inset-1 rounded-[inherit] border border-primary/20"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative flex h-full flex-col p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <GlassCard className="flex items-center gap-2 px-3 py-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-white">
                <Sparkles className="size-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">
                  AI Command Center
                </p>
                <p className="text-[10px] text-muted">6 agents operational</p>
              </div>
            </GlassCard>

            <GlassCard className="flex items-center gap-2 px-3 py-2">
              <Zap className="size-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-primary">
                AI Agent Active
              </span>
              <PulseDot />
            </GlassCard>
          </div>

          <div className="relative min-h-0 flex-1">
            <AnimatePresence mode="wait">
              {floating ? (
                <FloatingToast
                  key={floating.id}
                  activity={floating}
                  slot={FLOAT_SLOTS[slotIndex]}
                />
              ) : null}
            </AnimatePresence>

            <motion.div
              style={{ x: parallax.x, y: parallax.y }}
              className="absolute right-0 bottom-0 z-10 w-[52%] max-w-[220px] sm:w-[48%] sm:max-w-[240px]"
            >
              <GlassCard className="p-3 sm:p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <LiveBadge />
                    <span className="text-[11px] font-semibold text-foreground">
                      Activity Stream
                    </span>
                  </div>
                </div>

                <div className="max-h-[140px] overflow-hidden sm:max-h-[160px]">
                  <AnimatePresence initial={false} mode="popLayout">
                    {feed.map((activity) => (
                      <ActivityRow key={activity.id} activity={activity} />
                    ))}
                  </AnimatePresence>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          <GlassCard className="mt-auto flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-4">
              {[
                { label: 'Signals', value: '1.2k' },
                { label: 'Qualified', value: '312' },
                { label: 'Outreach', value: '89' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-[10px] text-muted">{stat.label}</p>
                  <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1">
              <CalendarCheck className="size-3 text-primary" />
              <span className="text-[10px] font-semibold text-primary">24 booked</span>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </motion.div>
  )
}
