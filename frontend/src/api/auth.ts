import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from '@/types/auth'

import { apiClient } from './client'

export async function register(payload: RegisterRequest): Promise<User> {
  const { data } = await apiClient.post<User>('/auth/register', payload)
  return data
}

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>('/auth/login', payload)
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/auth/me')
  return data
}
