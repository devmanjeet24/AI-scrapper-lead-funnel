import { motion } from 'framer-motion'
import { Plus, Zap } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { getFirstName } from '@/lib/user-display'
import { cn } from '@/lib/utils'

import { AI_AGENTS } from './dashboard-data'

const ease = [0.22, 1, 0.36, 1] as const

function PulseDot() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
      <span className="relative size-2 rounded-full bg-primary" />
    </span>
  )
}

function StatValue({ value, loading }: { value: number; loading: boolean }) {
  if (loading) {
    return <span className="inline-block h-6 w-10 animate-pulse rounded bg-foreground/10" />
  }
  return <>{value.toLocaleString()}</>
}

export function DashboardHeader() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useDashboardStats()

  const firstName = getFirstName(user?.full_name ?? '')
  const signalsToday = stats?.signalsToday ?? 0
  const leadsToday = stats?.leadsToday ?? 0
  const meetingsRecent = stats?.meetingsToday ?? 0
  const activeAgents = AI_AGENTS.length

  const heroStats = [
    { label: 'Signals', value: stats?.signalsToday ?? 0 },
    { label: 'Qualified', value: stats?.leadsToday ?? 0 },
    { label: 'Meetings', value: stats?.meetingsToday ?? 0 },
  ] as const

  return (
    <div className="relative">
      <div
        className="hero-ambient-glow pointer-events-none absolute -inset-3 rounded-[calc(var(--radius-card)+12px)]"
        aria-hidden
      />

      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="relative rounded-[var(--radius-card)] p-px"
      >
        <div className="hero-border-glow absolute inset-0 rounded-[var(--radius-card)]" />

        <div
          className={cn(
            'glass-surface-strong relative overflow-hidden rounded-[var(--radius-card)]',
            'p-6 sm:p-8',
          )}
          style={{ boxShadow: 'var(--shadow-elevated)' }}
        >
          <div className="hero-gradient-overlay pointer-events-none absolute inset-0" />
          <div className="hero-decorative-arc pointer-events-none" aria-hidden />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                Mission Control
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Welcome back, {firstName}
                </h1>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/40 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
                  <PulseDot />
                  AI agents active
                </span>
              </div>

              <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-[15px]">
                {isLoading ? (
                  'Loading your pipeline summary…'
                ) : (
                  <>
                    Your agents discovered{' '}
                    <span className="font-semibold text-foreground">
                      {signalsToday.toLocaleString()} signals
                    </span>
                    , qualified{' '}
                    <span className="font-semibold text-foreground">
                      {leadsToday.toLocaleString()} leads
                    </span>
                    , and booked{' '}
                    <span className="font-semibold text-primary">
                      {meetingsRecent.toLocaleString()} meetings
                    </span>{' '}
                    in the last 24 hours — all on autopilot.
                  </>
                )}
              </p>

              <div className="flex items-center gap-2 text-xs text-muted">
                <Zap className="size-3.5 text-primary" />
                <span>
                  {activeAgents} agents running
                  {user?.organization.name ? (
                    <>
                      {' '}
                      ·{' '}
                      <span className="font-medium text-foreground">{user.organization.name}</span>
                    </>
                  ) : null}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-4 sm:items-end">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-[var(--radius-button)] sm:self-end',
                  'bg-primary px-5 py-3 text-sm font-semibold text-white',
                  'shadow-[var(--shadow-button)] transition-shadow duration-200 hover:shadow-[var(--shadow-button-hover)]',
                )}
              >
                <Plus className="size-4" />
                Create Campaign
              </motion.button>

              <div className="hero-stat-grid grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-primary/10 p-px">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-surface-solid px-4 py-3 text-center transition-colors duration-200 hover:bg-primary/[0.03] sm:min-w-[88px]"
                  >
                    <p className="text-lg font-semibold tabular-nums tracking-tight text-foreground sm:text-xl">
                      <StatValue value={stat.value} loading={isLoading} />
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.header>
    </div>
  )
}
