import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

import { useActivityStream } from './useActivityStream'

const ease = [0.22, 1, 0.36, 1] as const

const TYPE_STYLES = {
  signal: 'bg-section-alt/70 border-border',
  lead: 'bg-surface-solid/80 border-border',
  creative: 'bg-section-alt/70 border-border',
  outreach: 'bg-surface-solid/80 border-border',
  meeting: 'bg-section-alt/70 border-border',
} as const

function PulseDot() {
  return (
    <span className="relative flex size-1.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
      <span className="relative size-1.5 rounded-full bg-primary" />
    </span>
  )
}

export function ActivityFeed() {
  const events = useActivityStream()

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease }}
      aria-label="Live AI activity"
      className={cn(
        'glass-surface-feed flex h-full flex-col overflow-hidden rounded-[var(--radius-card)]',
        'border border-border-strong border-l-[3px] border-l-primary/25',
      )}
      style={{ boxShadow: 'var(--shadow-elevated)' }}
    >
      <div className="glass-surface-feed feed-header-wash relative border-b border-border px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Live feed</p>
            <h2 className="mt-0.5 text-base font-semibold text-foreground">AI activity</h2>
          </div>
          <span className="badge-live-pulse inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground">
            <PulseDot />
            Real-time
          </span>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[rgb(255_255_255/0.95)] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[rgb(255_255_255/0.95)] to-transparent" />
        <div className="max-h-[420px] overflow-y-auto px-4 py-3 sm:px-5">
          <AnimatePresence initial={false} mode="popLayout">
            {events.map((event, index) => {
              const Icon = event.icon
              const isNewest = index === 0

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: 20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: -12, height: 0 }}
                  transition={{ duration: 0.35, ease }}
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
                      <span className="flex shrink-0 items-center gap-1.5 text-[10px] text-muted">
                        {isNewest ? <PulseDot /> : null}
                        {event.time}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-muted">{event.detail}</p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  )
}
