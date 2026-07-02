export function AppointmentsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface-solid shadow-[var(--shadow-soft)]">
      <div className="space-y-0">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-border/60 px-5 py-4 last:border-b-0"
          >
            <div className="h-4 w-40 animate-pulse rounded bg-foreground/5" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-foreground/5" />
            <div className="h-4 w-28 animate-pulse rounded bg-foreground/5" />
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-foreground/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
