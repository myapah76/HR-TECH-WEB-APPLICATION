'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/src/stores/auth.store'
import { refreshToken, logout } from '@/src/services/auth.service'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore.getState().setAuth
  const clearAuth = useAuthStore.getState().logout

  useEffect(() => {
    console.log('vào Auth Provider')
    const initAuth = async () => {
      console.log('vào Auth init hàm')
      try {
        const res = await refreshToken()
        setAuth({
          user: res.data.userResponse,
          accessToken: res.data.accessToken,
        })
      } catch {
        await logout()
        clearAuth()
      }
    }
    initAuth()
  }, [setAuth, clearAuth])
  return <>{children}</>
}
