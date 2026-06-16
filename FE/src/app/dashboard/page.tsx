'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!user) return

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

  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
      </div>
      <p className="text-sm font-semibold text-slate-500">Đang tải...</p>
    </div>
  )
}
