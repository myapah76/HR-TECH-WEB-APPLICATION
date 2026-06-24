'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'
import Sidebar from '@/src/components/layout/Sidebar'
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Search,
  Users,
  Building2,
  BarChart3,
  MessageSquare,
  Settings,
} from 'lucide-react'

const recruiterNavItems = [
  {
    icon: LayoutDashboard,
    label: 'Tổng quan',
    path: '/recruiter',
  },
  {
    icon: PlusCircle,
    label: 'Đăng tin tuyển dụng',
    path: '/recruiter/post-job',
  },
  {
    icon: List,
    label: 'Quản lý tin đăng',
    path: '/recruiter/manage-jobs',
  },
  {
    icon: Search,
    label: 'Tìm ứng viên',
    path: '/recruiter/search',
  },
  {
    icon: Users,
    label: 'Đơn ứng tuyển',
    path: '/recruiter/applications',
    badge: 12,
  },
  {
    icon: Building2,
    label: 'Hồ sơ công ty',
    path: '/recruiter/profile',
  },
  {
    icon: BarChart3,
    label: 'Thống kê',
    path: '/recruiter/analytics',
  },
  {
    icon: MessageSquare,
    label: 'Tin nhắn',
    path: '/recruiter/messages',
    badge: 4,
  },
  {
    icon: Settings,
    label: 'Cài đặt',
    path: '/recruiter/settings',
  },
]

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (user.roleResponse?.name !== RoleUser.RECRUITER) {
      router.replace('/dashboard')
    }
  }, [user, isInitialized, router])

  if (!isInitialized || !user || user.roleResponse?.name !== RoleUser.RECRUITER) {
    return null
  }

  return (
    <div className="bg-slate-50/50 flex flex-col min-h-[calc(100vh-64px)]" id="recruiter-root">
      <div className="flex flex-1">
        <Sidebar items={recruiterNavItems} title="Nhà tuyển dụng" accentColor="emerald" />
        <main className="flex-1 p-6 lg:p-8 overflow-auto" id="recruiter-content">
          {children}
        </main>
      </div>
    </div>
  )
}
