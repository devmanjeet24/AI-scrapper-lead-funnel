import { LogOut, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

import { SIDEBAR_NAV } from './dashboard-data'

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function DashboardSidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  const displayName = user?.full_name ?? 'User'
  const workspaceName = user?.organization.name ?? 'Workspace'
  const initials = getInitials(displayName)

  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border/80 bg-surface-solid/60 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_4px_16px_rgb(28_200_141/0.3)]">
          <Sparkles className="size-[18px]" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">LeadFlow</p>
          <p className="text-[10px] font-medium text-muted">Mission Control</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {SIDEBAR_NAV.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-soft text-foreground shadow-[inset_0_0_0_1px_rgb(28_200_141/0.15)]'
                  : 'text-muted hover:bg-primary-soft/50 hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'size-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted group-hover:text-primary',
                )}
              />
              {item.label}
              {isActive ? (
                <span className="ml-auto size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgb(28_200_141/0.6)]" />
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border/60 p-4">
        <div className="rounded-xl border border-border/60 bg-section-alt/80 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-[10px] text-muted">{workspaceName}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-solid hover:text-foreground"
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
