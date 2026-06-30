import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { AnimatedCounter } from './AnimatedCounter'
import { KPI_METRICS } from './dashboard-data'

const ease = [0.22, 1, 0.36, 1] as const

function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  index,
}: {
  label: string
  value: number
  delta: string
  icon: LucideIcon
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.45, ease }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-surface-solid p-5',
        'transition-shadow duration-300 hover:shadow-[var(--shadow-soft)]',
      )}
    >
      <div
        className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(circle, rgb(28 200 141 / 0.08), transparent 70%)' }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[28px]">
            <AnimatedCounter value={value} />
          </p>
          <p className="text-xs font-medium text-primary">{delta}</p>
        </div>

        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105">
          <Icon className="size-[18px]" />
        </div>
      </div>
    </motion.div>
  )
}

export function KpiCards() {
  return (
    <section aria-label="Key metrics">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {KPI_METRICS.map((metric, index) => (
          <KpiCard key={metric.id} {...metric} index={index} />
        ))}
      </div>
    </section>
  )
}
