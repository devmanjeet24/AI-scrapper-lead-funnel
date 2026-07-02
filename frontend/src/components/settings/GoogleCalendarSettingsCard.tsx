import { useQueryClient } from '@tanstack/react-query'
import { Calendar, Link2, Loader2 } from 'lucide-react'

import { HealthStatusBadge } from '@/components/settings/HealthStatusBadge'
import { SettingsCard, SettingsRow, SettingsValue } from '@/components/settings/SettingsCard'
import {
  googleCalendarKeys,
  useConnectGoogleCalendarMutation,
  useDisconnectGoogleCalendarMutation,
} from '@/hooks/useAppointments'
import { settingsKeys } from '@/hooks/useSettings'
import { cn } from '@/lib/utils'
import type { GoogleCalendarSettingsStatus, HealthLevel } from '@/types/settings'

interface GoogleCalendarSettingsCardProps {
  status: GoogleCalendarSettingsStatus
}

const CONNECTION_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  expired: 'Expired',
  revoked: 'Revoked',
}

function resolveCalendarLevel(status: GoogleCalendarSettingsStatus): {
  level: HealthLevel
  label: string
} {
  if (!status.oauth_configured) return { level: 'error', label: 'Not configured' }
  if (status.connected) return { level: 'healthy', label: 'Connected' }
  if (status.status === 'expired' || status.status === 'revoked') {
    return { level: 'warning', label: 'Reconnect needed' }
  }
  return { level: 'warning', label: 'Not connected' }
}

export function GoogleCalendarSettingsCard({ status }: GoogleCalendarSettingsCardProps) {
  const queryClient = useQueryClient()
  const connectMutation = useConnectGoogleCalendarMutation()
  const disconnectMutation = useDisconnectGoogleCalendarMutation()

  const { level, label } = resolveCalendarLevel(status)
  const isBusy = connectMutation.isPending || disconnectMutation.isPending

  function refreshStatuses() {
    queryClient.invalidateQueries({ queryKey: settingsKeys.status() })
    queryClient.invalidateQueries({ queryKey: googleCalendarKeys.status() })
  }

  function handleConnect() {
    connectMutation.mutate(undefined, { onSuccess: refreshStatuses })
  }

  function handleDisconnect() {
    disconnectMutation.mutate(undefined, { onSuccess: refreshStatuses })
  }

  return (
    <SettingsCard
      icon={Calendar}
      title="Google Calendar"
      description="Availability lookups and appointment booking"
      action={<HealthStatusBadge level={level} label={label} />}
    >
      <div className="divide-y divide-border/70">
        <SettingsRow label="Server OAuth">
          <HealthStatusBadge
            level={status.oauth_configured ? 'healthy' : 'error'}
            label={status.oauth_configured ? 'Configured' : 'Missing'}
          />
        </SettingsRow>
        <SettingsRow label="Connection">
          <HealthStatusBadge
            level={status.connected ? 'healthy' : 'warning'}
            label={status.connected ? 'Connected' : 'Disconnected'}
          />
        </SettingsRow>
        <SettingsRow label="Connected email">
          <SettingsValue>{status.google_email ?? '—'}</SettingsValue>
        </SettingsRow>
        <SettingsRow label="Token status">
          <SettingsValue>
            {status.status ? (CONNECTION_STATUS_LABELS[status.status] ?? status.status) : '—'}
          </SettingsValue>
        </SettingsRow>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {status.connected ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={handleDisconnect}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[var(--radius-button)] border border-border bg-surface-solid px-4 py-2',
              'text-sm font-semibold text-foreground transition-colors hover:bg-section-alt disabled:opacity-50',
            )}
          >
            {disconnectMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            disabled={isBusy || !status.oauth_configured}
            onClick={handleConnect}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[var(--radius-button)] bg-primary px-4 py-2',
              'text-sm font-semibold text-white shadow-[var(--shadow-button)] transition-colors',
              'hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {connectMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Link2 className="size-4" />
            )}
            Connect Google Calendar
          </button>
        )}

        {!status.oauth_configured ? (
          <p className="text-xs text-amber-700">
            Google OAuth is not configured on the server.
          </p>
        ) : null}
      </div>
    </SettingsCard>
  )
}
