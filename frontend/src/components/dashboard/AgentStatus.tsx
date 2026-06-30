import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

import { AI_AGENTS } from './dashboard-data'

const ease = [0.22, 1, 0.36, 1] as const

export function AgentStatus() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease }}
      aria-label="Agent status"
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Agents</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            Autonomous workforce
          </h2>
        </div>
        <p className="text-sm text-muted">All systems operational</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {AI_AGENTS.map((agent, index) => {
          const Icon = agent.icon

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + index * 0.08, duration: 0.4, ease }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-border/70 bg-surface-solid p-5',
                'transition-shadow duration-300 hover:shadow-[var(--shadow-soft)]',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105">
                  <Icon className="size-[18px]" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft/60 px-2 py-0.5 text-[10px] font-semibold text-primary capitalize">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
                    <span className="relative size-1.5 rounded-full bg-primary" />
                  </span>
                  {agent.status}
                </span>
              </div>

              <h3 className="mt-4 text-sm font-semibold text-foreground">{agent.name}</h3>
              <p className="mt-1 text-xs text-muted">{agent.task}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-medium text-muted">Workload</span>
                  <span className="font-semibold tabular-nums text-foreground">{agent.progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-section-alt">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.progress}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.8, ease }}
                  />
                </div>
              </div>

              <p className="mt-3 text-[10px] font-medium text-primary">{agent.throughput}</p>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
