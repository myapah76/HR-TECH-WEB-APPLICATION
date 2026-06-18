import { create } from 'zustand'
import { User } from '../types/user'

interface AuthState {
  user: User | null
  accessToken: string | null

  setAuth: (data: { user: User; accessToken: string }) => void

  updateTokens: (accessToken: string) => void

  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

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
}))
