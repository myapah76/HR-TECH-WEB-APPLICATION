'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  console.log('user', user)

  useEffect(() => {
    if (!user) return
    console.log('role', user.roleResponse.name)

    switch (user.roleResponse.name) {
      case RoleUser.ADMIN_SYSTEM:
        router.replace('/admin')
        break

      case RoleUser.HR:
        router.replace('/company')
        break

      default:
        router.replace('/candidate')
    }
  }, [router, user])

  return <div>Loading...</div>
}
