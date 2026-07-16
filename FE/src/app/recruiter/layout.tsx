'use client'

import Sidebar from '@/src/components/layout/Sidebar'
import { useGetCompanyMembers, useGetMyCompany } from '@/src/hooks/company'
import { useAuthStore } from '@/src/stores/auth.store'
import {
  Building2,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  List,
  PlusCircle,
  Search,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react'
import { useMemo } from 'react'

const recruiterNavItems = [
  // ── Tổng quan ─────────────────────────────────────────────────────────────
  { label: 'Tổng quan', isHeader: true },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/recruiter' },

  // ── Tuyển dụng ────────────────────────────────────────────────────────────
  { label: 'Tuyển dụng', isHeader: true },
  { icon: PlusCircle, label: 'Đăng tin tuyển dụng', path: '/recruiter/post-job' },
  { icon: List, label: 'Quản lý tin đăng', path: '/recruiter/manage-jobs' },
  { icon: Search, label: 'AI Tìm Ứng Viên', path: '/recruiter/find-candidates' },
  { icon: Users, label: 'Đơn ứng tuyển', path: '/recruiter/applications' },
  { icon: CalendarClock, label: 'Quản Lý Lịch Phỏng Vấn', path: '/recruiter/interview-schedules' },

  // ── Công ty ───────────────────────────────────────────────────────────────
  { label: 'Công ty', isHeader: true },
  { icon: Building2, label: 'Hồ sơ công ty', path: '/recruiter/profile' },
  { icon: CreditCard, label: 'Gói & Thanh toán', path: '/recruiter/billing' },
]

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore()
  const { data: myCompany } = useGetMyCompany(isInitialized && !!user)

  const { data: companyMembers = [] } = useGetCompanyMembers(
    myCompany?.id,
    isInitialized && !!user && !!myCompany?.id
  )
  const currentMember = companyMembers.find((m) => m.userId === user?.id)
  const isOwner = currentMember?.role === 'OWNER'

  const navItems = useMemo(() => {
    const items = [...recruiterNavItems]

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
  }, [isOwner])

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
