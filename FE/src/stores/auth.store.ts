import { create } from 'zustand'
import { User } from '../types/user'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null

  setAuth: (data: { user: User; accessToken: string; refreshToken?: string }) => void

  updateTokens: (accessToken: string, refreshToken?: string) => void

  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isInitialized: false,

  setAuth: (data) =>
    set((state) => ({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken !== undefined ? data.refreshToken : state.refreshToken,
    })),
  updateTokens: (accessToken: string, refreshToken?: string) =>
    set((state) => ({
      accessToken,
      refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken,
    })),

  logout: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    }),
}))
