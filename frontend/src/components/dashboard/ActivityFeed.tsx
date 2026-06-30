import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

import { useActivityStream } from './useActivityStream'

const ease = [0.22, 1, 0.36, 1] as const

const TYPE_STYLES = {
  signal: 'bg-primary-soft/80 border-primary/15',
  lead: 'bg-section-alt border-border/60',
  creative: 'bg-primary-soft/50 border-primary/10',
  outreach: 'bg-section-alt border-border/60',
  meeting: 'bg-primary-soft border-primary/20',
} as const

export function ActivityFeed() {
  const events = useActivityStream()

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease }}
      aria-label="Live AI activity"
      className="flex h-full flex-col rounded-[var(--radius-card)] border border-border/70 bg-surface-solid"
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      <div className="border-b border-border/60 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Live feed</p>
            <h2 className="mt-0.5 text-base font-semibold text-foreground">AI activity</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary-soft/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative size-1.5 rounded-full bg-primary" />
            </span>
            Real-time
          </span>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-surface-solid to-transparent" />
        <div className="max-h-[420px] overflow-y-auto px-4 py-3 sm:px-5">
          <AnimatePresence initial={false} mode="popLayout">
            {events.map((event, index) => {
              const Icon = event.icon

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: 20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: -12, height: 0 }}
                  transition={{ duration: 0.35, ease }}
                  className={cn(
                    'mb-2 flex items-start gap-3 rounded-xl border p-3',
                    TYPE_STYLES[event.type],
                    index === 0 && 'ring-1 ring-primary/20',
                  )}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-solid text-primary shadow-sm">
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">{event.label}</p>
                      <span className="shrink-0 text-[10px] text-muted">{event.time}</span>
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
