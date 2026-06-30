import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { AgentStatus } from '@/components/dashboard/AgentStatus'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { KpiCards } from '@/components/dashboard/KpiCards'
import { PipelineOverview } from '@/components/dashboard/PipelineOverview'
import { SIDEBAR_NAV } from '@/components/dashboard/dashboard-data'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(28 200 141 / 0.06) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative flex flex-col">
        <div className="border-b border-border/60 bg-surface-solid/80 px-4 py-3 backdrop-blur-xl lg:hidden">
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
                      ? 'bg-primary-soft text-foreground'
                      : 'text-muted hover:bg-primary-soft/50 hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5" />
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

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px] xl:gap-8">
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
