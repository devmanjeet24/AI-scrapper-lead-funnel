import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { useDashboardStats } from '@/hooks/useDashboardStats'
import type { DashboardStats } from '@/types/dashboard'
import { cn } from '@/lib/utils'

import { AnimatedCounter } from './AnimatedCounter'
import { PIPELINE_STAGE_DEFINITIONS } from './dashboard-data'

const ease = [0.22, 1, 0.36, 1] as const

function conversionRate(from: number, to: number) {
  if (from === 0) return '—'
  return `${((to / from) * 100).toFixed(1)}%`
}

function getStageCount(id: string, stats: DashboardStats): number {
  switch (id) {
    case 'signals':
      return stats.signals
    case 'leads':
      return stats.leads
    case 'creatives':
      return stats.creatives
    case 'outreach':
      return stats.outreach
    case 'meetings':
      return stats.meetings
    default:
      return 0
  }
}

function getActiveStageIndex(counts: number[]): number {
  for (let index = counts.length - 2; index >= 0; index -= 1) {
    if (counts[index] > counts[index + 1]) return index
  }
  return Math.min(3, counts.length - 1)
}

export function PipelineOverview() {
  const { data: stats, isLoading } = useDashboardStats()

  const stages = PIPELINE_STAGE_DEFINITIONS.map((stage) => ({
    ...stage,
    count: stats ? getStageCount(stage.id, stats) : 0,
  }))

  const counts = stages.map((stage) => stage.count)
  const activeStageIndex = stats ? getActiveStageIndex(counts) : 3

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5, ease }}
      aria-label="Pipeline overview"
      className={cn(
        'panel-surface card-interactive relative overflow-hidden rounded-[var(--radius-card)]',
        'border border-border-strong',
      )}
    >
      <div className="panel-header-wash border-b border-border px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Pipeline
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              AI workflow in motion
            </h2>
            <p className="mt-1 text-sm text-muted">
              Live conversion flow across your automated funnel
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/50 px-3 py-1.5 text-xs font-medium text-foreground shadow-[var(--shadow-soft)]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative size-1.5 rounded-full bg-primary" />
            </span>
            {isLoading ? 'Syncing…' : 'Processing live'}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="pipeline-canvas relative rounded-xl border border-primary/10 p-5 sm:p-6">
          <div className="relative">
            <div className="hidden lg:block">
              <div className="absolute left-[8%] right-[8%] top-[36px] h-px bg-border-strong" />
              <div className="absolute left-[8%] right-[8%] top-[35px] h-0.5 overflow-hidden rounded-full">
                <motion.div
                  className="pipeline-flow-line h-full w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
              {stages.map((stage, index) => {
                const Icon = stage.icon
                const prevCount = index > 0 ? stages[index - 1].count : null
                const rate = prevCount !== null ? conversionRate(prevCount, stage.count) : null
                const isFinalStage = index === stages.length - 1
                const isActiveStage = index === activeStageIndex

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
                        <ArrowRight className="size-3 text-muted" />
                        <span className="text-[10px] font-semibold text-muted">
                          {isLoading ? '—' : rate}
                        </span>
                      </div>
                    ) : null}

                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'relative flex w-full min-h-[148px] flex-col items-center justify-center rounded-2xl border px-3 py-4 transition-shadow duration-300',
                        isFinalStage
                          ? 'border-primary/20 bg-surface-solid shadow-[var(--shadow-soft)]'
                          : isActiveStage
                            ? 'stage-active-pulse border-primary/25 bg-surface-solid shadow-[var(--shadow-soft)]'
                            : 'border-border bg-surface-solid shadow-[var(--shadow-inset-highlight)] hover:border-primary/15 hover:shadow-[var(--shadow-soft)]',
                      )}
                    >
                      <div
                        className={cn(
                          'mb-2.5 flex size-10 items-center justify-center rounded-full ring-2 transition-transform duration-200',
                          isFinalStage
                            ? 'bg-primary text-white shadow-[var(--shadow-button)] ring-primary/20'
                            : isActiveStage
                              ? 'bg-surface-solid text-primary ring-primary/25'
                              : 'bg-section-alt text-foreground/60 ring-border',
                        )}
                      >
                        <Icon className="size-[18px]" />
                      </div>

                      <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">
                        {isLoading ? (
                          <span className="inline-block h-7 w-12 animate-pulse rounded bg-foreground/10" />
                        ) : (
                          <AnimatedCounter value={stage.count} />
                        )}
                      </p>
                      <p className="mt-1 text-xs font-medium text-muted">{stage.label}</p>

                      {isActiveStage && !isLoading ? (
                        <p className="mt-2 text-[10px] font-semibold text-primary">Processing</p>
                      ) : null}

                      {rate && !isActiveStage && !isLoading ? (
                        <p className="mt-2 hidden text-[10px] font-semibold text-muted lg:block">
                          {rate} conv.
                        </p>
                      ) : null}
                    </motion.div>

                    {index < stages.length - 1 ? (
                      <div className="absolute -right-3 top-[36px] z-10 hidden -translate-y-1/2 lg:flex">
                        <motion.div
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.15, duration: 0.3 }}
                          className="glass-surface flex items-center gap-1 rounded-full border border-border px-2 py-0.5 shadow-[var(--shadow-soft)]"
                        >
                          <ArrowRight className="size-3 text-primary/60" />
                          <span className="text-[9px] font-bold text-muted">
                            {isLoading
                              ? '—'
                              : conversionRate(stage.count, stages[index + 1].count)}
                          </span>
                        </motion.div>
                      </div>
                    ) : null}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
