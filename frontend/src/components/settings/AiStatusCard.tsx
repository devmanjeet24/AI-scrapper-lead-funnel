import { Bot } from 'lucide-react'

import { HealthStatusBadge } from '@/components/settings/HealthStatusBadge'
import { SettingsCard, SettingsRow, SettingsValue } from '@/components/settings/SettingsCard'
import type { AiStatus, HealthLevel } from '@/types/settings'

interface AiStatusCardProps {
  ai: AiStatus
}

function resolveAiLevel(ai: AiStatus): { level: HealthLevel; label: string } {
  if (!ai.configured) return { level: 'error', label: 'Not configured' }
  if (!ai.enabled) return { level: 'warning', label: 'Disabled' }
  return { level: 'healthy', label: 'Active' }
}

export function AiStatusCard({ ai }: AiStatusCardProps) {
  const { level, label } = resolveAiLevel(ai)

  return (
    <SettingsCard
      icon={Bot}
      title="AI Provider"
      description="Post-scrape intelligence and generation engine"
      action={<HealthStatusBadge level={level} label={label} />}
    >
      <div className="divide-y divide-border/70">
        <SettingsRow label="Provider">
          <SettingsValue>{ai.provider.charAt(0).toUpperCase() + ai.provider.slice(1)}</SettingsValue>
        </SettingsRow>
        <SettingsRow label="Model">
          <code className="truncate rounded-md bg-section-alt px-2 py-0.5 text-xs font-medium text-foreground">
            {ai.model}
          </code>
        </SettingsRow>
        <SettingsRow label="API key configured">
          <HealthStatusBadge
            level={ai.configured ? 'healthy' : 'error'}
            label={ai.configured ? 'Configured' : 'Missing'}
          />
        </SettingsRow>
        <SettingsRow label="AI enabled">
          <HealthStatusBadge
            level={ai.enabled ? 'healthy' : 'warning'}
            label={ai.enabled ? 'Enabled' : 'Disabled'}
          />
        </SettingsRow>
      </div>

      {!ai.configured ? (
        <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-800">
          Set <code className="font-semibold">GROQ_API_KEY</code> in the backend environment to enable AI features.
        </p>
      ) : null}
    </SettingsCard>
  )
}
