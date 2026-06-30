import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAppSelector } from '@/store/hooks'

export function ProtectedRoute() {
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const location = useLocation()

  if (!accessToken) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return <Outlet />
}
