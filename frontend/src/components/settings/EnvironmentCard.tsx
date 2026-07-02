import { Server } from 'lucide-react'

import { HealthStatusBadge } from '@/components/settings/HealthStatusBadge'
import { SettingsCard, SettingsRow, SettingsValue } from '@/components/settings/SettingsCard'
import { cn } from '@/lib/utils'
import type { EnvironmentStatus, HealthLevel } from '@/types/settings'

interface EnvironmentCardProps {
  environment: EnvironmentStatus
}

function resolveEnvLevel(appEnv: string): HealthLevel {
  const normalized = appEnv.toLowerCase()
  if (normalized === 'production') return 'healthy'
  if (normalized === 'staging') return 'warning'
  return 'warning'
}

export function EnvironmentCard({ environment }: EnvironmentCardProps) {
  const normalized = environment.app_env.toLowerCase()
  const isProduction = normalized === 'production'

  return (
    <SettingsCard
      icon={Server}
      title="Environment"
      description="Current backend runtime configuration"
      action={
        <HealthStatusBadge
          level={resolveEnvLevel(environment.app_env)}
          label={isProduction ? 'Production' : 'Non-production'}
        />
      }
    >
      <div className="divide-y divide-border/70">
        <SettingsRow label="App environment">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
              isProduction
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-blue-200 bg-blue-50 text-blue-700',
            )}
          >
            {environment.app_env}
          </span>
        </SettingsRow>
        <SettingsRow label="Mode">
          <SettingsValue>{isProduction ? 'Live traffic' : 'Development / testing'}</SettingsValue>
        </SettingsRow>
      </div>
    </SettingsCard>
  )
}
