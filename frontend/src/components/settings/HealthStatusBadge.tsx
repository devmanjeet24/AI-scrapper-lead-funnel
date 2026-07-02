import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { HealthLevel } from '@/types/settings'

const LEVEL_STYLES: Record<HealthLevel, string> = {
  healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-red-200 bg-red-50 text-red-700',
}

const LEVEL_ICONS: Record<HealthLevel, typeof CheckCircle2> = {
  healthy: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

interface HealthStatusBadgeProps {
  level: HealthLevel
  label: string
  className?: string
}

export function HealthStatusBadge({ level, label, className }: HealthStatusBadgeProps) {
  const Icon = LEVEL_ICONS[level]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        LEVEL_STYLES[level],
        className,
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}
