import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { AgentStatus } from '@/components/dashboard/AgentStatus'
import { DashboardAtmosphere } from '@/components/dashboard/DashboardAtmosphere'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { PipelineOverview } from '@/components/dashboard/PipelineOverview'
import { SIDEBAR_NAV } from '@/components/dashboard/dashboard-data'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  return (
    <div className="relative isolate min-h-full bg-background">
      <DashboardAtmosphere />

      <div className="relative z-0 flex flex-col">
        <div className="glass-surface border-b border-border px-4 py-3 lg:hidden">
          <nav className="flex gap-1 overflow-x-auto pb-0.5">
            {SIDEBAR_NAV.map((item) => {
              const Icon = item.icon
              const isActive = item.href === '/dashboard'

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
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 sm:gap-8">
            <DashboardHeader />
            <KpiCards />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px] xl:items-stretch xl:gap-6">
              <PipelineOverview />
              <ActivityFeed />
            </div>

            <AgentStatus />
          </div>
        </motion.main>
      </div>
    </div>
  )
}
