import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

export function FloatingCard({
  children,
  className,
  delay = 0,
  float = false,
}: {
  children: ReactNode
  className?: string
  delay?: number
  float?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0, ...(float ? { y: [0, -4, 0] } : {}) }}
      transition={
        float
          ? { y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }, opacity: { delay, duration: 0.4, ease } }
          : { delay, duration: 0.45, ease }
      }
      className={cn(
        'rounded-xl border border-white/60 bg-surface-solid/95 p-3',
        'shadow-[0_8px_32px_rgb(45_45_45/0.06),0_2px_8px_rgb(28_200_141/0.06)]',
        'backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

export function MetricPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-primary/10 bg-primary-soft/40 px-2.5 py-1.5">
      <p className="text-sm font-bold tabular-nums text-primary">{value}</p>
      <p className="text-[9px] font-medium text-muted">{label}</p>
    </div>
  )
}

export function LiveBadge({ label = 'Live' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary-soft/60 px-2 py-0.5">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
        <span className="relative size-1.5 rounded-full bg-primary" />
      </span>
      <span className="text-[9px] font-semibold text-primary uppercase">{label}</span>
    </span>
  )
}

export function DashboardScene({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative min-h-[140px]', className)}>
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-50"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 50%, rgb(28 200 141 / 0.08), transparent 70%)',
        }}
      />
      <div className="relative space-y-2.5">{children}</div>
    </div>
  )
}
