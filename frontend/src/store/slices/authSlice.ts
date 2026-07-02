import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { User } from '@/types/auth'

export interface AuthState {
  accessToken: string | null
  user: User | null
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload
    },
    setAuth(
      state,
      action: PayloadAction<{ accessToken: string; user: User | null }>,
    ) {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
    },
    clearAuth(state) {
      state.accessToken = null
      state.user = null
    },
  },
})

export const { setAccessToken, setUser, setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
