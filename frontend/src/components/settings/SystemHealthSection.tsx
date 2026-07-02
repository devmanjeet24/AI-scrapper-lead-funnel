import type { LucideIcon } from 'lucide-react'
import { Activity, Database, Loader2, RefreshCw, Server } from 'lucide-react'

import { HealthStatusBadge } from '@/components/settings/HealthStatusBadge'
import { SettingsCard } from '@/components/settings/SettingsCard'
import { useApiHealthQuery, useDatabaseHealthQuery } from '@/hooks/useSettings'
import { cn } from '@/lib/utils'
import type { HealthCheckResult, HealthLevel } from '@/types/settings'

interface HealthRowConfig {
  id: string
  name: string
  icon: LucideIcon
  isLoading: boolean
  result: HealthCheckResult | undefined
}

function toLevel(result: HealthCheckResult | undefined): HealthLevel {
  if (!result) return 'warning'
  return result.ok ? 'healthy' : 'error'
}

export function SystemHealthSection() {
  const apiHealth = useApiHealthQuery()
  const dbHealth = useDatabaseHealthQuery()

  const isRefreshing = apiHealth.isFetching || dbHealth.isFetching

  function handleRefresh() {
    apiHealth.refetch()
    dbHealth.refetch()
  }

  const rows: HealthRowConfig[] = [
    {
      id: 'api',
      name: 'Backend API',
      icon: Server,
      isLoading: apiHealth.isLoading,
      result: apiHealth.data,
    },
    {
      id: 'db',
      name: 'Database',
      icon: Database,
      isLoading: dbHealth.isLoading,
      result: dbHealth.data,
    },
  ]

  return (
    <SettingsCard
      icon={Activity}
      title="System Health"
      description="Live infrastructure checks (auto-refreshes every 60s)"
      action={
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-border bg-surface-solid px-3 py-1.5',
            'text-xs font-medium text-muted transition-colors hover:bg-section-alt hover:text-foreground disabled:opacity-50',
          )}
        >
          <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
          Refresh
        </button>
      }
    >
      <div className="divide-y divide-border/70">
        {rows.map((row) => {
          const Icon = row.icon
          const level = toLevel(row.result)

          return (
            <div
              key={row.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-section-alt text-muted">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{row.name}</p>
                  {row.result?.detail ? (
                    <p className="text-xs text-red-600">{row.result.detail}</p>
                  ) : null}
                </div>
              </div>

              {row.isLoading ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <Loader2 className="size-3.5 animate-spin" />
                  Checking…
                </span>
              ) : (
                <HealthStatusBadge level={level} label={row.result?.label ?? 'Unknown'} />
              )}
            </div>
          )
        })}
      </div>
    </SettingsCard>
  )
}
