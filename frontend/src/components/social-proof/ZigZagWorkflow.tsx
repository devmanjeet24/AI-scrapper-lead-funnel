import { motion } from 'framer-motion'
import {
  CalendarCheck,
  Radio,
  Send,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

type StatusBadge = 'Live' | 'Running' | 'Qualified' | 'Booked'

interface WorkflowStep {
  id: string
  label: string
  description: string
  status: StatusBadge
  metric: string
  metricLabel: string
  icon: LucideIcon
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 'signals',
    label: 'Signals',
    description: 'Intent signals scanned across thousands of sources',
    status: 'Live',
    metric: '1,284',
    metricLabel: 'detected today',
    icon: Radio,
  },
  {
    id: 'leads',
    label: 'Leads',
    description: 'Prospects scored and ranked against your ICP',
    status: 'Qualified',
    metric: '312',
    metricLabel: 'qualified',
    icon: Users,
  },
  {
    id: 'creatives',
    label: 'Creatives',
    description: 'Personalized copy generated per account',
    status: 'Running',
    metric: '89',
    metricLabel: 'variants live',
    icon: Sparkles,
  },
  {
    id: 'outreach',
    label: 'Outreach',
    description: 'Multi-channel sequences running autonomously',
    status: 'Running',
    metric: '24',
    metricLabel: 'sequences',
    icon: Send,
  },
  {
    id: 'meetings',
    label: 'Meetings',
    description: 'Demos booked directly on rep calendars',
    status: 'Booked',
    metric: '18',
    metricLabel: 'this week',
    icon: CalendarCheck,
  },
]

const CARD_SIZE = 400
const ZIGZAG_Y = 110
const STICKY_TOP = 80
const VISIBLE_STEPS = 2.25
const GLOW_INSET = 16
const WHEEL_SENSITIVITY = 0.0011
/** Content height: cards + zigzag offset + progress row */
const WORKFLOW_TRACK_HEIGHT = CARD_SIZE + ZIGZAG_Y + 56

function getTrackMetrics(visibleWidth: number) {
  const stepX = visibleWidth / VISIBLE_STEPS
  const lastIndex = workflowSteps.length - 1
  const startX = visibleWidth / 2 - CARD_SIZE / 2
  const endX = visibleWidth / 2 - CARD_SIZE / 2 - lastIndex * stepX
  const scrollDistance = Math.max(0, startX - endX)
  const trackWidth = lastIndex * stepX + CARD_SIZE + GLOW_INSET * 2

  return { stepX, startX, scrollDistance, trackWidth }
}

const statusStyles: Record<StatusBadge, string> = {
  Live: 'border-primary/30 bg-primary-soft text-primary',
  Running: 'border-border bg-surface/90 text-foreground',
  Qualified: 'border-primary/25 bg-primary-soft text-primary',
  Booked: 'border-primary/40 bg-primary text-white',
}

function buildPath(stepCount: number, stepX: number, trackHeight: number) {
  const centerY = trackHeight / 2 - ZIGZAG_Y / 2
  const points = Array.from({ length: stepCount }, (_, i) => ({
    x: i * stepX + CARD_SIZE / 2,
    y: i % 2 === 0 ? centerY : centerY + ZIGZAG_Y,
  }))

  return points.reduce(
    (path, point, i) =>
      i === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`,
    '',
  )
}

const softSpring = { type: 'spring' as const, stiffness: 70, damping: 22, mass: 0.9 }
const softEase = { type: 'tween' as const, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }

function getStepFocus(progress: number, index: number, total: number) {
  if (total <= 1) return 1
  const position = progress * (total - 1)
  return Math.max(0, 1 - Math.abs(position - index))
}

function WorkflowNode({
  step,
  index,
  stepX,
  progress,
  totalSteps,
}: {
  step: WorkflowStep
  index: number
  stepX: number
  progress: number
  totalSteps: number
}) {
  const Icon = step.icon
  const yOffset = index % 2 === 0 ? 0 : ZIGZAG_Y
  const focus = getStepFocus(progress, index, totalSteps)
  const isActive = focus > 0.55
  const scale = 0.98 + focus * 0.02
  const opacity = 0.86 + focus * 0.14

  return (
    <motion.div
      className="absolute"
      style={{
        left: index * stepX,
        top: yOffset,
        width: CARD_SIZE,
      }}
      animate={{ y: [0, index % 2 === 0 ? -4 : 4, 0] }}
      transition={{
        duration: 7 + index * 0.4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: index * 0.2,
      }}
    >
      <motion.div
        animate={{ scale, opacity }}
        transition={softSpring}
        className={cn(
          'relative flex flex-col items-center rounded-full px-10 py-8 text-center',
          'border bg-surface/90 backdrop-blur-2xl',
          'shadow-[0_36px_90px_rgb(28_200_141/0.15),0_14px_36px_rgb(45_45_45/0.08)]',
          'transition-[border-color,box-shadow] duration-700 ease-out',
          isActive
            ? 'border-primary/45 shadow-[0_0_70px_rgb(28_200_141/0.2),0_36px_90px_rgb(28_200_141/0.14)]'
            : 'border-border/60',
        )}
        style={{ width: CARD_SIZE, height: CARD_SIZE }}
      >
        {isActive ? (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background:
                  'radial-gradient(circle, rgb(28 200 141 / 0.18) 0%, transparent 70%)',
              }}
            />
            <div className="absolute -inset-4 rounded-full border border-primary/20 transition-opacity duration-700" />
          </>
        ) : null}

        <span
          className={cn(
            'absolute top-7 right-7 rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide uppercase',
            statusStyles[step.status],
          )}
        >
          {step.status}
        </span>

        <span className="font-mono text-[10px] tracking-[0.24em] text-muted uppercase">
          0{index + 1}
        </span>

        <div
          className={cn(
            'mt-3 flex size-16 items-center justify-center rounded-2xl transition-all duration-700 ease-out',
            isActive
              ? 'bg-primary text-white shadow-[0_0_24px_rgb(28_200_141/0.35)]'
              : 'bg-primary-soft text-primary',
          )}
        >
          <Icon className="size-8" strokeWidth={1.5} />
        </div>

        <h3
          className={cn(
            'mt-4 text-2xl font-bold tracking-tight transition-colors duration-700 ease-out',
            isActive ? 'text-primary' : 'text-foreground',
          )}
        >
          {step.label}
        </h3>

        <p className="mt-2 line-clamp-2 px-3 text-sm leading-snug text-muted">
          {step.description}
        </p>

        <div className="mt-auto pt-3">
          <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {step.metric}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-primary">
            {step.metricLabel}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface ZigZagWorkflowProps {
  onProgressChange?: (progress: number, isComplete: boolean) => void
  children?: ReactNode
}

export function ZigZagWorkflow({
  onProgressChange,
  children,
}: ZigZagWorkflowProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const isEngagedRef = useRef(false)

  const [progress, setProgress] = useState(0)
  const [stepX, setStepX] = useState(CARD_SIZE * 1.45)
  const [trackWidth, setTrackWidth] = useState(CARD_SIZE * 5)
  const [startX, setStartX] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [isEngaged, setIsEngaged] = useState(false)

  const trackHeight = WORKFLOW_TRACK_HEIGHT
  const translateX = startX - progress * maxScroll

  const pathD = useMemo(
    () => buildPath(workflowSteps.length, stepX, trackHeight),
    [stepX, trackHeight],
  )

  const activeIndex = Math.min(
    workflowSteps.length - 1,
    Math.max(0, Math.round(progress * (workflowSteps.length - 1))),
  )

  const isInStory = isEngaged && progress > 0.01 && progress < 0.99
  const isComplete = progress >= 0.995

  const updateMetrics = useCallback(() => {
    if (!stageRef.current) return
    const visible = stageRef.current.offsetWidth
    const { stepX: spacing, startX: sx, scrollDistance, trackWidth: width } =
      getTrackMetrics(visible)

    setStepX(spacing)
    setStartX(sx)
    setMaxScroll(scrollDistance)
    setTrackWidth(width)
  }, [])

  const checkEngaged = useCallback(() => {
    const el = stageRef.current
    if (!el) return false

    const rect = el.getBoundingClientRect()
    const current = progressRef.current
    const nearPin =
      rect.top <= STICKY_TOP + 12 && rect.top >= STICKY_TOP - 48
    const midStory = current > 0.005 && current < 0.995

    return nearPin || (midStory && rect.top < window.innerHeight * 0.62)
  }, [])

  useEffect(() => {
    progressRef.current = progress
    onProgressChange?.(progress, isComplete)
  }, [progress, isComplete, onProgressChange])

  useEffect(() => {
    updateMetrics()
    window.addEventListener('resize', updateMetrics)
    return () => window.removeEventListener('resize', updateMetrics)
  }, [updateMetrics])

  useEffect(() => {
    const syncEngagement = () => {
      const engaged = checkEngaged()
      isEngagedRef.current = engaged
      setIsEngaged(engaged)
    }

    syncEngagement()
    window.addEventListener('scroll', syncEngagement, { passive: true })
    window.addEventListener('resize', syncEngagement)
    return () => {
      window.removeEventListener('scroll', syncEngagement)
      window.removeEventListener('resize', syncEngagement)
    }
  }, [checkEngaged])

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!isEngagedRef.current) return

      const current = progressRef.current
      const delta = e.deltaY * WHEEL_SENSITIVITY

      if (delta > 0) {
        if (current < 1) {
          e.preventDefault()
          const next = Math.min(1, current + delta)
          progressRef.current = next
          setProgress(next)
        }
        return
      }

      if (delta < 0 && current > 0) {
        e.preventDefault()
        const next = Math.max(0, current + delta)
        progressRef.current = next
        setProgress(next)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div className="mt-6">
      <div
        ref={stageRef}
        className="relative overflow-hidden"
        style={{ height: WORKFLOW_TRACK_HEIGHT }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-section-alt to-transparent sm:w-20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-section-alt to-transparent sm:w-20"
          aria-hidden
        />

        <motion.div
          className="absolute top-1/2 left-0 -translate-y-1/2 will-change-transform"
          animate={{ x: translateX }}
          transition={softEase}
          style={{
            width: trackWidth,
            height: trackHeight,
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0 overflow-hidden"
            width={trackWidth}
            height={trackHeight}
            aria-hidden
          >
            <path
              d={pathD}
              fill="none"
              stroke="rgb(28 200 141 / 0.25)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <motion.path
              d={pathD}
              fill="none"
              stroke="rgb(28 200 141 / 0.75)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="4 16"
              animate={{ strokeDashoffset: [0, -80] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </svg>

          {workflowSteps.map((step, index) => (
            <WorkflowNode
              key={step.id}
              step={step}
              index={index}
              stepX={stepX}
              progress={progress}
              totalSteps={workflowSteps.length}
            />
          ))}
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 pb-1">
          <div className="flex items-center gap-2">
            {workflowSteps.map((step, i) => (
              <div
                key={step.id}
                className={cn(
                  'h-1 rounded-full transition-all duration-700 ease-out',
                  activeIndex === i
                    ? 'w-10 bg-primary shadow-[0_0_12px_rgb(28_200_141/0.4)]'
                    : 'w-2 bg-primary/20',
                )}
              />
            ))}
          </div>
          {isInStory ? (
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
              Scroll to advance
            </p>
          ) : null}
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          opacity: isComplete ? 1 : 0.5,
          y: isComplete ? 0 : 4,
        }}
        transition={softEase}
        className="border-t border-border/50 pt-6"
      >
        {children}
      </motion.div>
    </div>
  )
}
