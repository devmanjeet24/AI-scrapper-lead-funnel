import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getMe, login as loginRequest, register as registerRequest } from '@/api/auth'
import { getAuthErrorMessage } from '@/lib/auth-errors'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearAuth, setAuth, setUser } from '@/store/slices/authSlice'
import type { LoginRequest, RegisterRequest, User } from '@/types/auth'

export function useAuth() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { accessToken, user } = useAppSelector((state) => state.auth)

  const isAuthenticated = Boolean(accessToken)

  const fetchCurrentUser = useCallback(async (): Promise<User> => {
    const currentUser = await getMe()
    dispatch(setUser(currentUser))
    return currentUser
  }, [dispatch])

  const completeSession = useCallback(
    async (token: string, redirectTo = '/dashboard') => {
      dispatch(setAuth({ accessToken: token, user: null }))
      const currentUser = await fetchCurrentUser()
      dispatch(setAuth({ accessToken: token, user: currentUser }))
      navigate(redirectTo, { replace: true })
    },
    [dispatch, fetchCurrentUser, navigate],
  )

  const login = useCallback(
    async (payload: LoginRequest, redirectTo = '/dashboard') => {
      try {
        const { access_token } = await loginRequest(payload)
        await completeSession(access_token, redirectTo)
      } catch (error) {
        throw new Error(getAuthErrorMessage(error, 'Unable to sign in. Please try again.'))
      }
    },
    [completeSession],
  )

  const register = useCallback(
    async (payload: RegisterRequest, redirectTo = '/dashboard') => {
      try {
        await registerRequest(payload)
      } catch (error) {
        throw new Error(
          getAuthErrorMessage(error, 'Unable to create account. Please try again.'),
        )
      }

      try {
        const { access_token } = await loginRequest({
          email: payload.email,
          password: payload.password,
        })
        await completeSession(access_token, redirectTo)
      } catch (error) {
        throw new Error(
          getAuthErrorMessage(
            error,
            'Account created but sign-in failed. Please try logging in.',
          ),
        )
      }
    },
    [completeSession],
  )

  const logout = useCallback(() => {
    dispatch(clearAuth())
    navigate('/login', { replace: true })
  }, [dispatch, navigate])

  return {
    accessToken,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    fetchCurrentUser,
  }
}
