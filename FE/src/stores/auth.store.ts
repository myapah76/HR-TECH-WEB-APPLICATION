import { create } from 'zustand'
import { User } from '../types/user'
import { queryClient } from '../lib/queryClient'

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
      document.cookie =
        'hasSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax'
      document.cookie =
        'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax'

      // Loop and sweep all document cookies to ensure complete cleanup
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
        if (name) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`
        }
      }
    }
    // Xóa toàn bộ cache React Query để tránh hiển thị data của user cũ
    queryClient.clear()
    return set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isInitialized: true,
    })
  },
  setInitialized: (isInitialized) => set({ isInitialized }),
}))
