import { LogOut, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/lib/user-display'
import { cn } from '@/lib/utils'

import { SIDEBAR_NAV } from './dashboard-data'

export function DashboardSidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  const displayName = user?.full_name ?? 'User'
  const workspaceName = user?.organization.name ?? 'Workspace'
  const initials = getInitials(displayName)

  return (
    <aside
      className={cn(
        'sticky top-0 z-20 hidden h-screen w-[240px] shrink-0 flex-col',
        'border-r border-border-strong sidebar-surface lg:flex',
      )}
      style={{ boxShadow: 'var(--shadow-sidebar)' }}
    >
      <div className="sidebar-brand-glow pointer-events-none absolute inset-x-0 top-0 h-36" aria-hidden />

      <div className="relative flex items-center gap-2.5 px-5 py-6">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-[var(--shadow-button)] transition-transform duration-200 hover:scale-[1.03]">
          <Sparkles className="size-[18px]" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">LeadFlow</p>
          <p className="text-[10px] font-medium text-muted">Mission Control</p>
        </div>
      </div>

      <nav className="relative flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
        {SIDEBAR_NAV.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
                isActive
                  ? 'sidebar-active-wash border-l-[3px] border-primary bg-surface-solid pl-[calc(0.75rem-3px)] font-semibold text-foreground shadow-[var(--shadow-soft)] ring-1 ring-primary/10'
                  : 'font-medium text-muted hover:bg-primary/[0.04] hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'size-4 shrink-0 transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted group-hover:text-primary/70',
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="relative mt-auto shrink-0 border-t border-border p-4">
        <div
          className="glass-surface-strong card-interactive relative overflow-hidden rounded-xl border border-border p-3"
          style={{ boxShadow: 'var(--shadow-soft)' }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent" />
          <div className="relative flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[rgb(22_163_110)] text-xs font-bold text-white shadow-[var(--shadow-soft)]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-[10px] text-muted">{workspaceName}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-1.5 text-muted transition-all duration-200 hover:bg-primary/[0.08] hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
