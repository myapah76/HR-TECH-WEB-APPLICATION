'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'
import Loading from '../loading'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) return

    if (!user) {
      router.replace('/login')
      return
    }

    switch (user.roleResponse.name) {
      case RoleUser.ADMIN_SYSTEM:
        router.replace('/admin')
        break

      case RoleUser.RECRUITER:
        router.replace('/recruiter')
        break

      default:
        router.replace('/candidate')
    }
  }, [router, user, isInitialized])

  return <Loading />
}
