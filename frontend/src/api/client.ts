import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { clearAuth } from '@/store/slices/authSlice'
import { store } from '@/store'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? ''
      const isAuthRequest =
        requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')

      if (!isAuthRequest) {
        const hadToken = Boolean(store.getState().auth.accessToken)
        store.dispatch(clearAuth())

        if (hadToken && window.location.pathname !== '/login') {
          const redirect = encodeURIComponent(
            `${window.location.pathname}${window.location.search}`,
          )
          window.location.assign(`/login?redirect=${redirect}`)
        }
      }
    }

    return Promise.reject(error)
  },
)
