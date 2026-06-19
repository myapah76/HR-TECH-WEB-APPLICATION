'use client'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/src/stores/auth.store'
import { refreshToken, logout } from '@/src/services/auth.service'
import { useRouter } from 'next/navigation'
import { checkCookiesEnabled } from '@/src/lib/utils'
import Loading from '@/src/app/loading'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const setAuth = useAuthStore.getState().setAuth
  const clearAuth = useAuthStore.getState().logout
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('vào Auth Provider')
    const initAuth = async () => {
      console.log('vào Auth init hàm')
      const { refreshToken: storeRefreshToken } = useAuthStore.getState()
      const cookiesEnabled = checkCookiesEnabled()
      const hasSession =
        typeof window !== 'undefined' ? localStorage.getItem('hasSession') === 'true' : false

      // nếu không có quyền cookie và không có refresh token (chế độ không cookie)
      // HOẶC nếu có cookie nhưng local không ghi nhận session (chưa đăng nhập)
      if ((!cookiesEnabled && !storeRefreshToken) || (cookiesEnabled && !hasSession)) {
        clearAuth()
        setIsLoading(false)
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
        if (hasSession || storeRefreshToken) {
          try {
            await logout(refreshReqData)
          } catch {
            console.warn('Logout failed during initialization cleanup')
          }
        }
        clearAuth()
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [setAuth, clearAuth, router])

  if (isLoading) {
    return <Loading />
  }

  return <>{children}</>
}
