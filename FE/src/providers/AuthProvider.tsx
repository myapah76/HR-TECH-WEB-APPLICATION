'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/src/stores/auth.store'
import { refreshToken, logout } from '@/src/services/auth.service'
import { useRouter } from 'next/navigation'
import { checkCookiesEnabled } from '@/src/utils'
import Loading from '@/src/app/loading'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const setAuth = useAuthStore.getState().setAuth
  const clearAuth = useAuthStore.getState().logout
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const { refreshToken: storeRefreshToken } = useAuthStore.getState()
      const cookiesEnabled = checkCookiesEnabled()

      if (!cookiesEnabled && !storeRefreshToken) {
        clearAuth()
        setIsLoading(false)
        useAuthStore.getState().setInitialized(true)
        return
      }

      const refreshReqData =
        !cookiesEnabled && storeRefreshToken ? { refreshToken: storeRefreshToken } : undefined

      try {
        const res = await refreshToken(refreshReqData)
        setAuth({
          user: res.data.userResponse,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        })
      } catch {
        try {
          await logout(refreshReqData)
        } catch {
          console.warn('Logout failed during initialization cleanup')
        }
        clearAuth()
      } finally {
        setIsLoading(false)
        useAuthStore.getState().setInitialized(true)
      }
    }
    initAuth()
  }, [setAuth, clearAuth, router])

  if (isLoading) {
    return <Loading />
  }

  return <>{children}</>
}
