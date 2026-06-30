import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getMe } from '@/api/auth'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearAuth, setUser } from '@/store/slices/authSlice'

interface AuthBootstrapProps {
  children: React.ReactNode
}

const PUBLIC_PATHS = ['/', '/login', '/register']

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const [ready, setReady] = useState(!accessToken)

  useEffect(() => {
    if (!accessToken) {
      setReady(true)
      return
    }

    let cancelled = false

    getMe()
      .then((currentUser) => {
        if (!cancelled) {
          dispatch(setUser(currentUser))
          setReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch(clearAuth())
          const path = window.location.pathname
          if (!PUBLIC_PATHS.includes(path)) {
            navigate('/login', { replace: true })
          }
          setReady(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, dispatch, navigate])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading session…</p>
      </div>
    )
  }

  return children
}
