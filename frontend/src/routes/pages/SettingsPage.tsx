import { motion } from 'framer-motion'
import { isAxiosError } from 'axios'
import { Link, useLocation } from 'react-router-dom'

import { DashboardAtmosphere } from '@/components/dashboard/DashboardAtmosphere'
import { SIDEBAR_NAV } from '@/components/dashboard/dashboard-data'
import { AiStatusCard } from '@/components/settings/AiStatusCard'
import { EnvironmentCard } from '@/components/settings/EnvironmentCard'
import { FutureIntegrationsCard } from '@/components/settings/FutureIntegrationsCard'
import { GoogleCalendarSettingsCard } from '@/components/settings/GoogleCalendarSettingsCard'
import { SettingsErrorState } from '@/components/settings/SettingsErrorState'
import { SettingsPageHeader } from '@/components/settings/SettingsPageHeader'
import { SettingsSkeleton } from '@/components/settings/SettingsSkeleton'
import { SystemHealthSection } from '@/components/settings/SystemHealthSection'
import { useSettingsStatusQuery } from '@/hooks/useSettings'
import { cn } from '@/lib/utils'

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string') return detail
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong while loading settings.'
}

export function SettingsPage() {
  const { pathname } = useLocation()
  const { data, isLoading, isError, error, refetch } = useSettingsStatusQuery()

  return (
    <div className="relative isolate min-h-full bg-background">
      <DashboardAtmosphere />

      <div className="relative z-0 flex flex-col">
        <div className="glass-surface border-b border-border px-4 py-3 lg:hidden">
          <nav className="flex gap-1 overflow-x-auto pb-0.5">
            {SIDEBAR_NAV.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    isActive
                      ? 'sidebar-active-wash border-l-[3px] border-primary bg-surface-solid pl-[calc(0.75rem-3px)] font-semibold text-foreground shadow-[var(--shadow-soft)]'
                      : 'text-muted hover:bg-foreground/[0.04] hover:text-foreground',
                  )}
                >
                  <Icon className={cn('size-3.5', isActive && 'text-primary')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        >
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
            <SettingsPageHeader appEnv={data?.environment.app_env} />

            {isLoading ? <SettingsSkeleton /> : null}

            {isError && !isLoading ? (
              <SettingsErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
            ) : null}

            {!isLoading && !isError && data ? (
              <div className="flex flex-col gap-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  <AiStatusCard ai={data.ai} />
                  <GoogleCalendarSettingsCard status={data.google_calendar} />
                  <EnvironmentCard environment={data.environment} />
                  <SystemHealthSection />
                </div>

                <FutureIntegrationsCard integrations={data.future_integrations} />
              </div>
            ) : null}
          </div>
        </motion.main>
      </div>
    </div>
  )
}
