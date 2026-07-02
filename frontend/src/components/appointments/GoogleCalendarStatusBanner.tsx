import { AlertCircle, Calendar, Link2, Loader2 } from 'lucide-react'

import {
  useConnectGoogleCalendarMutation,
  useDisconnectGoogleCalendarMutation,
  useGoogleCalendarStatusQuery,
} from '@/hooks/useAppointments'
import { cn } from '@/lib/utils'

interface GoogleCalendarStatusBannerProps {
  className?: string
}

export function GoogleCalendarStatusBanner({ className }: GoogleCalendarStatusBannerProps) {
  const { data: status, isLoading } = useGoogleCalendarStatusQuery()
  const connectMutation = useConnectGoogleCalendarMutation()
  const disconnectMutation = useDisconnectGoogleCalendarMutation()

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border border-border/80 bg-section-alt/40 px-4 py-3 text-sm text-muted',
          className,
        )}
      >
        <Loader2 className="size-4 animate-spin" />
        Checking calendar connection…
      </div>
    )
  }

  if (status?.connected) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3',
          className,
        )}
      >
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 size-4 text-emerald-700" />
          <div>
            <p className="text-sm font-medium text-emerald-900">Google Calendar connected</p>
            <p className="text-xs text-emerald-800/80">
              {status.google_email ?? 'Calendar linked'}
              {status.calendar_id ? ` · ${status.calendar_id}` : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={disconnectMutation.isPending}
          onClick={() => disconnectMutation.mutate()}
          className="text-xs font-medium text-emerald-800 underline-offset-2 hover:underline disabled:opacity-50"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3',
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 size-4 text-amber-700" />
        <div>
          <p className="text-sm font-medium text-amber-900">Google Calendar not connected</p>
          <p className="text-xs text-amber-800/80">
            Connect your calendar to load availability and confirm appointments.
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={connectMutation.isPending}
        onClick={() => connectMutation.mutate()}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-2',
          'text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-50 disabled:opacity-50',
        )}
      >
        {connectMutation.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Link2 className="size-3.5" />
        )}
        Connect Google Calendar
      </button>
    </div>
  )
}
