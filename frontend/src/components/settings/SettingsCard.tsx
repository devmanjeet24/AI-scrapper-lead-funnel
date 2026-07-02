import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SettingsCardProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function SettingsCard({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
}: SettingsCardProps) {
  return (
    <section
      className={cn(
        'rounded-[var(--radius-card)] border border-border bg-surface-solid p-5 shadow-[var(--shadow-card)] sm:p-6',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
            {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  )
}

interface SettingsRowProps {
  label: string
  children: ReactNode
  className?: string
}

export function SettingsRow({ label, children, className }: SettingsRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-t border-border/70 py-3 first:border-t-0 first:pt-0',
        className,
      )}
    >
      <span className="text-sm text-muted">{label}</span>
      <div className="flex min-w-0 items-center justify-end gap-2 text-right">{children}</div>
    </div>
  )
}

export function SettingsValue({ children }: { children: ReactNode }) {
  return <span className="truncate text-sm font-medium text-foreground">{children}</span>
}
