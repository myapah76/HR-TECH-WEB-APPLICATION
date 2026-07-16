import { create } from 'zustand'
import { User } from '../types/user'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isInitialized: boolean

  setAuth: (data: { user: User; accessToken: string; refreshToken?: string }) => void

  updateTokens: (accessToken: string, refreshToken?: string) => void

  logout: () => void
  setInitialized: (isInitialized: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isInitialized: false,

  setAuth: (data) =>
    set((state) => {
      if (typeof document !== 'undefined') {
        document.cookie = 'hasSession=true; path=/; max-age=604800; SameSite=Lax'
        document.cookie = `userRole=${data.user.roleResponse.name}; path=/; max-age=604800; SameSite=Lax`
      }
      return {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken !== undefined ? data.refreshToken : state.refreshToken,
        isInitialized: true,
      }
    }),
  updateTokens: (accessToken: string, refreshToken?: string) =>
    set((state) => ({
      accessToken,
      refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken,
    })),

  logout: () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'hasSession=; path=/; max-age=0; SameSite=Lax'
      document.cookie = 'userRole=; path=/; max-age=0; SameSite=Lax'
    }
    return set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isInitialized: true,
    })
  },
  setInitialized: (isInitialized) => set({ isInitialized }),
}))
