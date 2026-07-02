import { cn } from '@/lib/utils'

const SKELETON_ROWS = 8

export function LeadsTableSkeleton() {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-surface-solid',
        'shadow-[var(--shadow-soft)]',
      )}
      aria-busy="true"
      aria-label="Loading leads"
    >
      <div className="border-b border-border/60 px-5 py-4">
        <div className="h-4 w-32 animate-pulse rounded bg-foreground/5" />
      </div>
      <div className="divide-y divide-border/50">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <div className="h-4 w-40 animate-pulse rounded bg-foreground/5" />
            <div className="hidden h-4 w-16 animate-pulse rounded bg-foreground/5 sm:block" />
            <div className="hidden h-6 w-20 animate-pulse rounded-full bg-foreground/5 md:block" />
            <div className="hidden h-4 w-28 animate-pulse rounded bg-foreground/5 lg:block" />
            <div className="hidden h-6 w-16 animate-pulse rounded-full bg-foreground/5 lg:block" />
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-foreground/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
