import { motion } from 'framer-motion'

import { useDashboardStats } from '@/hooks/useDashboardStats'
import { cn } from '@/lib/utils'

import { AI_AGENTS } from './dashboard-data'

const ease = [0.22, 1, 0.36, 1] as const

function getAgentThroughput(
  agentId: string,
  stats: NonNullable<ReturnType<typeof useDashboardStats>['data']>,
): string {
  switch (agentId) {
    case 'signal':
      return `${stats.signalsToday > 0 ? stats.signalsToday : stats.signals} signals`
    case 'lead':
      return `${stats.leadsToday > 0 ? stats.leadsToday : stats.leads} leads`
    case 'creative':
      return `${stats.creativesToday > 0 ? stats.creativesToday : stats.creatives} assets`
    case 'outreach':
      return `${stats.activeOutreach > 0 ? stats.activeOutreach : stats.outreach} campaigns`
    default:
      return ''
  }
}

function getAgentTask(
  agentId: string,
  stats: NonNullable<ReturnType<typeof useDashboardStats>['data']>,
): string {
  switch (agentId) {
    case 'signal':
      return stats.signals > 0 ? `Monitoring ${stats.signals.toLocaleString()} signals` : 'Awaiting signal data'
    case 'lead':
      return stats.leadsToday > 0
        ? `Scoring ${stats.leadsToday} new prospects`
        : 'Ready to qualify incoming leads'
    case 'creative':
      return stats.creatives > 0 ? 'Generating personalized copy' : 'Standing by for creative requests'
    case 'outreach':
      return stats.activeOutreach > 0
        ? `Running ${stats.activeOutreach} live sequences`
        : 'No active outreach campaigns'
    default:
      return ''
  }
}

function getAgentProgress(
  agentId: string,
  stats: NonNullable<ReturnType<typeof useDashboardStats>['data']>,
): number {
  switch (agentId) {
    case 'signal':
      return stats.signals > 0 ? Math.min(95, 40 + stats.signalsToday * 3) : 12
    case 'lead':
      return stats.leads > 0 ? Math.min(90, 35 + stats.leadsToday * 5) : 10
    case 'creative':
      return stats.creatives > 0 ? Math.min(85, 30 + stats.creativesToday * 4) : 8
    case 'outreach':
      return stats.activeOutreach > 0 ? Math.min(98, 50 + stats.activeOutreach * 8) : 5
    default:
      return 0
  }
}

export function AgentStatus() {
  const { data: stats, isLoading } = useDashboardStats()
  const allOperational = stats ? stats.signals + stats.leads >= 0 : true

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease }}
      aria-label="Agent status"
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">Agents</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Autonomous workforce
          </h2>
        </div>
        <p className="text-sm text-muted">
          {isLoading ? 'Checking systems…' : allOperational ? 'All systems operational' : 'Systems idle'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {AI_AGENTS.map((agent, index) => {
          const Icon = agent.icon
          const progress = stats ? getAgentProgress(agent.id, stats) : 0
          const task = stats ? getAgentTask(agent.id, stats) : agent.task
          const throughput = stats ? getAgentThroughput(agent.id, stats) : agent.throughput

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + index * 0.08, duration: 0.4, ease }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-border bg-surface-solid p-5',
                'transition-shadow duration-300 hover:border-primary/15 hover:shadow-[var(--shadow-card-hover)]',
              )}
              style={{ boxShadow: 'var(--shadow-inset-highlight)' }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105">
                  <Icon className="size-[18px]" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft/40 px-2 py-0.5 text-[10px] font-semibold text-foreground capitalize">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
                    <span className="relative size-1.5 rounded-full bg-primary" />
                  </span>
                  {agent.status}
                </span>
              </div>

              <h3 className="relative mt-4 text-sm font-semibold text-foreground">{agent.name}</h3>
              <p className="relative mt-1 text-xs text-muted">{task}</p>

              <div className="relative mt-4 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-medium text-muted">Workload</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {isLoading ? '—' : `${progress}%`}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-section-alt">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                    initial={{ width: 0 }}
                    animate={{ width: isLoading ? '0%' : `${progress}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease }}
                  />
                </div>
              </div>

              <p className="relative mt-3 text-[10px] font-medium text-muted">{throughput}</p>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
