import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

import { useDashboardStats } from '@/hooks/useDashboardStats'
import type { DashboardStats } from '@/types/dashboard'
import { cn } from '@/lib/utils'

import { AnimatedCounter } from './AnimatedCounter'
import { KPI_DEFINITIONS } from './dashboard-data'

const ease = [0.22, 1, 0.36, 1] as const

type KpiTier = 'hero' | 'secondary' | 'standard'

function getKpiTier(id: string): KpiTier {
  if (id === 'meetings') return 'hero'
  if (id === 'leads') return 'secondary'
  return 'standard'
}

const TIER_STYLES: Record<
  KpiTier,
  { card: string; surface: string; elevation: string; overlay?: string }
> = {
  hero: {
    card: 'border-border-strong hover:shadow-[var(--shadow-card-hover)]',
    surface: 'bg-surface-solid',
    elevation: 'kpi-surface-hero',
    overlay: 'kpi-hero-overlay',
  },
  secondary: {
    card: 'border-border-strong hover:shadow-[var(--shadow-card-hover)]',
    surface: 'bg-surface-solid',
    elevation: 'kpi-surface-raised',
  },
  standard: {
    card: 'border-border hover:shadow-[var(--shadow-soft)]',
    surface: 'bg-surface-solid',
    elevation: 'kpi-surface-raised',
  },
}

function getMetricValue(id: string, stats: DashboardStats): number {
  switch (id) {
    case 'signals':
      return stats.signals
    case 'leads':
      return stats.leads
    case 'creatives':
      return stats.creatives
    case 'outreach':
      return stats.activeOutreach
    case 'meetings':
      return stats.meetings
    default:
      return 0
  }
}

function getMetricDelta(id: string, stats: DashboardStats): string {
  switch (id) {
    case 'signals':
      return stats.signalsToday > 0 ? `+${stats.signalsToday} today` : 'No new signals today'
    case 'leads':
      return stats.leadsToday > 0 ? `+${stats.leadsToday} today` : 'No new leads today'
    case 'creatives':
      return stats.creativesToday > 0 ? `+${stats.creativesToday} today` : 'No new creatives today'
    case 'outreach':
      return stats.activeOutreach > 0
        ? `${stats.activeOutreach} active`
        : `${stats.outreach} total campaigns`
    case 'meetings':
      return stats.meetingsThisWeek > 0
        ? `+${stats.meetingsThisWeek} this week`
        : `${stats.meetings} total booked`
    default:
      return ''
  }
}

function KpiCard({
  id,
  label,
  value,
  delta,
  icon: Icon,
  index,
  loading,
}: {
  id: string
  label: string
  value: number
  delta: string
  icon: LucideIcon
  index: number
  loading: boolean
}) {
  const tier = getKpiTier(id)
  const styles = TIER_STYLES[tier]
  const isHighlight = tier === 'hero' || tier === 'secondary'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.45, ease }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-5',
        'transition-shadow duration-300',
        styles.surface,
        styles.elevation,
        styles.card,
        tier === 'secondary' && 'border-l-[3px] border-l-primary/25',
        tier === 'hero' && 'ring-1 ring-primary/10',
      )}
    >
      {styles.overlay ? (
        <div className={cn('pointer-events-none absolute inset-0', styles.overlay)} />
      ) : null}

      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-muted">{label}</p>
          <p
            className={cn(
              'tabular-nums tracking-tight text-foreground',
              tier === 'hero'
                ? 'text-2xl font-bold sm:text-[30px]'
                : 'text-2xl font-semibold sm:text-[28px]',
            )}
          >
            {loading ? (
              <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-foreground/10" />
            ) : (
              <AnimatedCounter value={value} />
            )}
          </p>
          <p className={cn('text-xs font-medium', isHighlight ? 'text-primary' : 'text-muted')}>
            {loading ? (
              <span className="inline-block h-3 w-24 animate-pulse rounded bg-foreground/10" />
            ) : (
              delta
            )}
          </p>
        </div>

        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-105',
            isHighlight
              ? 'border-primary/10 bg-primary-soft text-primary shadow-[var(--shadow-soft)]'
              : 'border-border bg-section-alt text-foreground/60 group-hover:border-primary/15 group-hover:text-primary/70',
          )}
        >
          <Icon className="size-[18px]" />
        </div>
      </div>
    </motion.div>
  )
}

export function KpiCards() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <section aria-label="Key metrics">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {KPI_DEFINITIONS.map((metric, index) => (
          <KpiCard
            key={metric.id}
            id={metric.id}
            label={metric.label}
            value={stats ? getMetricValue(metric.id, stats) : 0}
            delta={stats ? getMetricDelta(metric.id, stats) : ''}
            icon={metric.icon}
            index={index}
            loading={isLoading}
          />
        ))}
      </div>
    </section>
  )
}
