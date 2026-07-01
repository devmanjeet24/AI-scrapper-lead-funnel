import { Outlet } from 'react-router-dom'

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <div className="relative z-0 flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  )
}
