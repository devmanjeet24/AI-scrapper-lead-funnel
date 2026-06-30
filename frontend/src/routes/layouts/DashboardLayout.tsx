import { Outlet } from 'react-router-dom'

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  )
}
