'use client'
import { useEffect } from 'react'
import { useAuthStore } from '@/src/stores/auth.store'
import { refreshToken, logout } from '@/src/services/auth.service'
import { useRouter } from 'next/navigation'
import { checkCookiesEnabled } from '@/src/lib/utils'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const setAuth = useAuthStore.getState().setAuth
  const clearAuth = useAuthStore.getState().logout

  useEffect(() => {
    console.log('vào Auth Provider')
    const initAuth = async () => {
      console.log('vào Auth init hàm')
      const { refreshToken: storeRefreshToken } = useAuthStore.getState()
      const cookiesEnabled = checkCookiesEnabled()

      // nếu không có quyền cookie và không có refresh token
      if (!cookiesEnabled && !storeRefreshToken) {
        clearAuth()
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
        await logout(refreshReqData)
        clearAuth()
      }
    }
    initAuth()
  }, [setAuth, clearAuth, router])
  return <>{children}</>
}
