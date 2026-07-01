'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'
import Sidebar from '@/src/components/layout/Sidebar'
import { LayoutDashboard, Users, Briefcase, Building2, FileBarChart, Settings } from 'lucide-react'

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Bảng điều khiển', path: '/admin' },
  { icon: Users, label: 'Quản lý người dùng', path: '/admin/users' },
  { icon: Briefcase, label: 'Quản lý tin tuyển', path: '/admin/jobs' },
  { icon: Building2, label: 'Quản lý công ty', path: '/admin/companies' },
  { icon: FileBarChart, label: 'Báo cáo', path: '/admin/reports' },
  { icon: Settings, label: 'Cấu hình hệ thống', path: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (user.roleResponse?.name !== RoleUser.ADMIN_SYSTEM) {
      router.replace('/dashboard')
    }
  }, [user, isInitialized, router])

  if (!isInitialized || !user || user.roleResponse?.name !== RoleUser.ADMIN_SYSTEM) {
    return null
  }

  return (
    <div className="bg-slate-50/50 flex flex-col min-h-[calc(100vh-64px)]" id="admin-root">
      <div className="flex flex-1">
        <Sidebar items={adminNavItems} title="Quản trị viên" accentColor="violet" />
        <main className="flex-1 p-6 lg:p-8 overflow-auto" id="admin-content">
          {children}
        </main>
      </div>
    </div>
  )
}
