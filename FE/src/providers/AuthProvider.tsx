'use client'
import { useEffect } from 'react'
import { useAuthStore } from '../stores/auth.store'
import { apiRaw } from '../lib/axios'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const setAuth = useAuthStore.getState().setAuth
  const logout = useAuthStore.getState().logout

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await apiRaw.post('/auth/refresh')
        setAuth({
          user: res.data.userResponse,
          accessToken: res.data.accessToken,
        })
      } catch {
        logout()
      }
    }
    initAuth()
  }, [setAuth, logout])
  return <>{children}</>
}
