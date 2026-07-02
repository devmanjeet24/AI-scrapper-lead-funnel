export function SettingsSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[var(--radius-card)] border border-border bg-surface-solid p-6 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 shrink-0 animate-pulse rounded-xl bg-foreground/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-foreground/10" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-foreground/[0.06]" />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((__, row) => (
              <div key={row} className="flex items-center justify-between">
                <div className="h-3 w-1/4 animate-pulse rounded bg-foreground/[0.06]" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-foreground/10" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
