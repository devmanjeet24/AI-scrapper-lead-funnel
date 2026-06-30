import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import { AnimatedCounter } from './AnimatedCounter'
import { PIPELINE_STAGES } from './dashboard-data'

const ease = [0.22, 1, 0.36, 1] as const

function conversionRate(from: number, to: number) {
  if (from === 0) return '—'
  return `${((to / from) * 100).toFixed(1)}%`
}

export function PipelineOverview() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5, ease }}
      aria-label="Pipeline overview"
      className="relative overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-surface-solid p-6 sm:p-8"
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pipeline</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            AI workflow in motion
          </h2>
          <p className="mt-1 text-sm text-muted">
            Live conversion flow across your automated funnel
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft/60 px-3 py-1.5 text-xs font-medium text-primary">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
            <span className="relative size-1.5 rounded-full bg-primary" />
          </span>
          Processing live
        </div>
      </div>

      <div className="relative">
        <div className="hidden lg:block">
          <div className="absolute left-[10%] right-[10%] top-[28px] h-px bg-border" />
          <motion.div
            className="absolute left-[10%] top-[27px] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20"
            initial={{ width: '0%' }}
            animate={{ width: '80%' }}
            transition={{ delay: 0.6, duration: 1.4, ease }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
          {PIPELINE_STAGES.map((stage, index) => {
            const Icon = stage.icon
            const prevCount = index > 0 ? PIPELINE_STAGES[index - 1].count : null
            const rate = prevCount !== null ? conversionRate(prevCount, stage.count) : null

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + index * 0.1, duration: 0.4, ease }}
                className="relative flex flex-col items-center text-center"
              >
                {index > 0 ? (
                  <div className="mb-2 flex items-center gap-1 lg:hidden">
                    <ArrowRight className="size-3 text-primary/50" />
                    <span className="text-[10px] font-semibold text-primary">{rate}</span>
                  </div>
                ) : null}

                <motion.div
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'relative flex w-full flex-col items-center rounded-2xl border px-3 py-5 transition-colors duration-300',
                    index === PIPELINE_STAGES.length - 1
                      ? 'border-primary/25 bg-primary-soft/50'
                      : 'border-border/60 bg-section-alt/50 hover:border-primary/20 hover:bg-primary-soft/30',
                  )}
                >
                  <div
                    className={cn(
                      'mb-3 flex size-11 items-center justify-center rounded-xl',
                      index === PIPELINE_STAGES.length - 1
                        ? 'bg-primary text-white shadow-[0_4px_16px_rgb(28_200_141/0.35)]'
                        : 'bg-surface-solid text-primary shadow-[0_2px_8px_rgb(45_45_45/0.04)]',
                    )}
                  >
                    <Icon className="size-5" />
                  </div>

                  <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                    <AnimatedCounter value={stage.count} />
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted">{stage.label}</p>

                  {rate ? (
                    <p className="mt-2 hidden text-[10px] font-semibold text-primary lg:block">
                      {rate} conv.
                    </p>
                  ) : null}
                </motion.div>

                {index < PIPELINE_STAGES.length - 1 ? (
                  <div className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 lg:flex">
                    <motion.div
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.15, duration: 0.3 }}
                      className="flex items-center gap-1 rounded-full border border-border/60 bg-surface-solid px-2 py-0.5 shadow-sm"
                    >
                      <ArrowRight className="size-3 text-primary" />
                      <span className="text-[9px] font-bold text-primary">
                        {conversionRate(stage.count, PIPELINE_STAGES[index + 1].count)}
                      </span>
                    </motion.div>
                  </div>
                ) : null}
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
