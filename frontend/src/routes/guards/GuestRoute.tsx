import { Navigate, Outlet } from 'react-router-dom'

import { useAppSelector } from '@/store/hooks'

export function GuestRoute() {
  const accessToken = useAppSelector((state) => state.auth.accessToken)

  if (accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
