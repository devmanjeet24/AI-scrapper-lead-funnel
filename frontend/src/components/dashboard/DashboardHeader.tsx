import { motion } from 'framer-motion'
import { Plus, Zap } from 'lucide-react'

import { cn } from '@/lib/utils'

const ease = [0.22, 1, 0.36, 1] as const

function PulseDot() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
      <span className="relative size-2 rounded-full bg-primary" />
    </span>
  )
}

export function DashboardHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="relative overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-surface-solid p-6 sm:p-8"
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 100% 0%, rgb(28 200 141 / 0.08), transparent 55%), radial-gradient(ellipse 50% 60% at 0% 100%, rgb(28 200 141 / 0.05), transparent 50%)',
        }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Welcome back, Saurabh
            </h1>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <PulseDot />
              AI agents active
            </span>
          </div>

          <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-[15px]">
            Your agents discovered{' '}
            <span className="font-semibold text-foreground">142 signals</span>, qualified{' '}
            <span className="font-semibold text-foreground">38 leads</span>, and booked{' '}
            <span className="font-semibold text-primary">5 meetings</span> in the last 24 hours —
            all on autopilot.
          </p>

          <div className="flex items-center gap-2 text-xs text-muted">
            <Zap className="size-3.5 text-primary" />
            <span>
              4 agents running · Last activity{' '}
              <span className="font-medium text-foreground">12 seconds ago</span>
            </span>
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-[var(--radius-button)]',
            'bg-primary px-5 py-3 text-sm font-semibold text-white',
            'shadow-[0_8px_24px_rgb(28_200_141/0.35)] transition-shadow hover:shadow-[0_12px_32px_rgb(28_200_141/0.45)]',
          )}
        >
          <Plus className="size-4" />
          Create Campaign
        </motion.button>
      </div>
    </motion.header>
  )
}
