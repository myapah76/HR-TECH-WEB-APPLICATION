'use client'
import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'
import Sidebar from '@/src/components/layout/Sidebar'
import { useGetCompanyApplicationCount } from '@/src/hooks/application'
import { useGetMyCompany, useGetCompanyMembers } from '@/src/hooks/company'
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Search,
  Users,
  Building2,
  Settings,
  CreditCard,
  UserCheck,
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
  },
  {
    icon: Building2,
    label: 'Hồ sơ công ty',
    path: '/recruiter/profile',
  },
  {
    icon: Settings,
    label: 'Cài đặt',
    path: '/recruiter/settings',
  },
  {
    icon: CreditCard,
    label: 'Gói & Thanh toán',
    path: '/recruiter/billing',
  },
]

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()
  const { data: myCompany } = useGetMyCompany(isInitialized && !!user)
  const { data: applicationCount } = useGetCompanyApplicationCount(myCompany?.id)

  const { data: companyMembers = [] } = useGetCompanyMembers(
    myCompany?.id,
    isInitialized && !!user && !!myCompany?.id
  )
  const currentMember = companyMembers.find((m) => m.userId === user?.id)
  const isOwner = currentMember?.role === 'OWNER'

  const navItems = useMemo(() => {
    let items = recruiterNavItems.map((item) =>
      item.path === '/recruiter/applications'
        ? { ...item, badge: applicationCount ?? 0 }
        : item
    )

    if (isOwner) {
      const settingsIndex = items.findIndex((item) => item.path === '/recruiter/settings')
      const membersItem = {
        icon: UserCheck,
        label: 'Quản lý nhân sự',
        path: '/recruiter/members',
      }
      if (settingsIndex !== -1) {
        items.splice(settingsIndex, 0, membersItem)
      } else {
        items.push(membersItem)
      }
    }

    return items
  }, [applicationCount, isOwner])

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
        <Sidebar items={navItems} title="Nhà tuyển dụng" accentColor="emerald" />
        <main className="flex-1 p-6 lg:p-8 overflow-auto" id="recruiter-content">
          {children}
        </main>
      </div>
    </div>
  )
}
