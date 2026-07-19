'use client'
import Sidebar from '@/src/components/layout/Sidebar'
import { RoleUser } from '@/src/enums/role.enum'
import { useAuthStore } from '@/src/stores/auth.store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
    Brain,
    CreditCard,
    FolderOpen,
    Heart,
    LayoutDashboard,
    MessageSquare,
    Send,
    Star,
    UserCircle,
    Sparkles,
} from 'lucide-react'

const candidateNavItems = [
  { label: 'Chính', isHeader: true },
  {
    icon: LayoutDashboard,
    label: 'Tổng quan',
    path: '/candidate',
  },
  { icon: UserCircle, label: 'Hồ sơ cá nhân', path: '/candidate/profile' },
  { icon: FolderOpen, label: 'Quản lý CV', path: '/candidate/cv' },

  { label: 'Việc làm', isHeader: true },
  { icon: Star, label: 'Gợi ý Việc làm', path: '/candidate/recommend-jobs' },
  {
    icon: Heart,
    label: 'Việc đã lưu',
    path: '/candidate/saved-jobs',
  },
  {
    icon: Send,
    label: 'Việc đã ứng tuyển',
    path: '/candidate/applied-jobs',
  },

  { label: 'Trí tuệ nhân tạo', isHeader: true },
  {
    icon: Brain,
    label: 'AI Assistant',
    path: '/candidate/ai-advisor',
  },
  {
    icon: Sparkles,
    label: 'AI Matching',
    path: '/candidate/ai-matching',
  },
  {
    icon: MessageSquare,
    label: 'Mock Interview',
    path: '/candidate/mock-interview',
  },

  { label: 'Hệ thống', isHeader: true },
  {
    icon: CreditCard,
    label: 'Quản lý dịch vụ',
    path: '/candidate/billing',
  },
]

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (user.roleResponse?.name !== RoleUser.CANDIDATE) {
      router.replace('/dashboard')
    }
  }, [user, isInitialized, router])

  if (!isInitialized || !user || user.requirePasswordChange || user.roleResponse?.name !== RoleUser.CANDIDATE) {
    return null
  }

  return (
    <div className="bg-slate-50/50 flex flex-col min-h-[calc(100vh-64px)]" id="candidate-root">
      <div className="flex flex-1">
        <Sidebar items={candidateNavItems} title="Ứng viên" accentColor="blue" />
        <main className="flex-1 p-6 lg:p-8 overflow-auto" id="candidate-content">
          {children}
        </main>
      </div>
    </div>
  )
}
