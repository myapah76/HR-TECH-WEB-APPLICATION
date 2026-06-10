import { create } from 'zustand'
import { User } from '../types/user'

interface AuthState {
  user: User | null
  accessToken: string | null
  isInitialized: boolean

  setAuth: (data: { user: User; accessToken: string }) => void

  updateTokens: (accessToken: string) => void

  logout: () => void

  setInitialized: (status: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false,

  setAuth: (data) =>
    set({
      user: data.user,
      accessToken: data.accessToken,
    }),
  updateTokens: (accessToken: string) =>
    set({
      accessToken,
    }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
    }),

  setInitialized: (status: boolean) =>
    set({
      isInitialized: status,
    }),
}))
