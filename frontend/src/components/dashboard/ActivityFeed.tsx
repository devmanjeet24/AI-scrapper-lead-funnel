import { formatDistanceToNow } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarCheck,
  Loader2,
  Mail,
  Palette,
  Radio,
  Sparkles,
  Users,
} from 'lucide-react'

import { useDashboardActivity } from '@/hooks/useDashboardStats'
import { cn } from '@/lib/utils'
import type { DashboardActivityType } from '@/types/dashboard'

const ease = [0.22, 1, 0.36, 1] as const

const TYPE_STYLES: Record<DashboardActivityType, string> = {
  signal: 'bg-section-alt/70 border-border',
  lead: 'bg-surface-solid/80 border-border',
  creative: 'bg-section-alt/70 border-border',
  outreach: 'bg-surface-solid/80 border-border',
  meeting: 'bg-section-alt/70 border-border',
}

const TYPE_ICONS = {
  signal: Radio,
  lead: Users,
  creative: Palette,
  outreach: Mail,
  meeting: CalendarCheck,
} as const

export function ActivityFeed() {
  const { data: events = [], isLoading, isError } = useDashboardActivity()

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease }}
      aria-label="Recent pipeline activity"
      className={cn(
        'glass-surface-feed flex h-full flex-col overflow-hidden rounded-[var(--radius-card)]',
        'border border-border-strong border-l-[3px] border-l-primary/25',
      )}
      style={{ boxShadow: 'var(--shadow-elevated)' }}
    >
      <div className="glass-surface-feed feed-header-wash relative border-b border-border px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Timeline</p>
            <h2 className="mt-0.5 text-base font-semibold text-foreground">Recent activity</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-section-alt/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            <Sparkles className="size-3 text-primary" />
            Live data
          </span>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[rgb(255_255_255/0.95)] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[rgb(255_255_255/0.95)] to-transparent" />
        <div className="max-h-[420px] overflow-y-auto px-4 py-3 sm:px-5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" />
              Loading activity…
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
              Unable to load activity timeline.
            </div>
          ) : null}

          {!isLoading && !isError && events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-section-alt/30 px-4 py-8 text-center">
              <p className="text-sm font-medium text-foreground">No activity yet</p>
              <p className="mt-1 text-xs text-muted">
                Run a scrape job or create a lead to start building your pipeline timeline.
              </p>
            </div>
          ) : null}

          {!isLoading && !isError && events.length > 0 ? (
            <AnimatePresence initial={false}>
              {events.map((event, index) => {
                const Icon = TYPE_ICONS[event.type]
                const isNewest = index === 0

                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease }}
                    className={cn(
                      'mb-2 flex items-start gap-3 rounded-xl border p-3 transition-all duration-200',
                      isNewest
                        ? 'border-primary/15 bg-primary-soft/25 shadow-[var(--shadow-soft)] ring-1 ring-primary/12'
                        : cn(TYPE_STYLES[event.type], 'hover:border-primary/10 hover:shadow-[var(--shadow-soft)]'),
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg',
                        isNewest
                          ? 'bg-primary-soft text-primary'
                          : 'bg-foreground/5 text-foreground/60',
                      )}
                    >
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground">{event.label}</p>
                        <span className="shrink-0 text-[10px] text-muted">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted">{event.detail}</p>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          ) : null}
        </div>
      </div>
    </motion.section>
  )
}
