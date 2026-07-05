'use client'
import Loading from '@/src/app/loading'
import { logout, refreshToken } from '@/src/services/auth.service'
import { useAuthStore } from '@/src/stores/auth.store'
import { checkCookiesEnabled } from '@/src/utils'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()
  const setAuth = useAuthStore.getState().setAuth
  const clearAuth = useAuthStore.getState().logout
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && user?.requirePasswordChange && pathname !== '/change-password') {
      router.replace('/change-password')
    }
  }, [user, isLoading, pathname, router])

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
          user: res.userResponse!,
          accessToken: res.accessToken!,
          refreshToken: res.refreshToken,
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
