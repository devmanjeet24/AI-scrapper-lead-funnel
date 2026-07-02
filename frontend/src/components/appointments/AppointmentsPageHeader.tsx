import { Search } from 'lucide-react'

import { APPOINTMENT_TAB_OPTIONS } from '@/lib/appointments'
import { cn } from '@/lib/utils'
import type { AppointmentListTab } from '@/types/appointment'

interface AppointmentsPageHeaderProps {
  totalCount: number
  displayedCount: number
  activeTab: AppointmentListTab
  searchQuery: string
  onTabChange: (tab: AppointmentListTab) => void
  onSearchChange: (value: string) => void
}

export function AppointmentsPageHeader({
  totalCount,
  displayedCount,
  activeTab,
  searchQuery,
  onTabChange,
  onSearchChange,
}: AppointmentsPageHeaderProps) {
  const activeTabLabel =
    APPOINTMENT_TAB_OPTIONS.find((option) => option.value === activeTab)?.label ?? 'Appointments'

  return (
    <header className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Appointments
        </h1>
        <p className="mt-1 text-sm text-muted">
          {displayedCount === totalCount
            ? `${totalCount} ${activeTabLabel.toLowerCase()} appointment${totalCount === 1 ? '' : 's'}`
            : `Showing ${displayedCount} of ${totalCount} ${activeTabLabel.toLowerCase()} appointments`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {APPOINTMENT_TAB_OPTIONS.map((option) => {
          const isActive = option.value === activeTab
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onTabChange(option.value)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-white shadow-[var(--shadow-soft)]'
                  : 'border-border/80 bg-surface-solid text-muted hover:bg-section-alt hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search appointments…"
          className={cn(
            'w-full rounded-xl border border-border/80 bg-surface-solid py-2.5 pl-10 pr-4 text-sm text-foreground',
            'placeholder:text-muted/70 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15',
          )}
        />
      </div>
    </header>
  )
}
