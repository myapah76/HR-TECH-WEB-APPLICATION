'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'
import Sidebar from '@/src/components/layout/Sidebar'
import { useQuery } from '@tanstack/react-query'
import { getSavedJobs } from '@/src/services/job.service'
import {
  LayoutDashboard,
  UserCircle,
  FolderOpen,
  Heart,
  Send,
  MessageSquare,
  Brain,
  Star,
} from 'lucide-react'

import { getMyApplications } from '@/src/services/application.service'

const candidateNavItems = [
  {
    icon: LayoutDashboard,
    label: 'Tổng quan',
    path: '/candidate',
  },
  { icon: UserCircle, label: 'Hồ sơ cá nhân', path: '/candidate/profile' },
  { icon: FolderOpen, label: 'Quản lý CV', path: '/candidate/cv' },
  { icon: Star, label: 'Gợi ý Việc làm', path: '/candidate/recommend-jobs' },
  {
    icon: Heart,
    label: 'Việc đã lưu',
    path: '/candidate/saved-jobs',
    badge: 0,
  },
  {
    icon: Send,
    label: 'Việc đã ứng tuyển',
    path: '/candidate/applied-jobs',
    badge: 0,
  },
  {
    icon: Brain,
    label: 'AI Assistant',
    path: '/candidate/ai-advisor',
  },
  {
    icon: MessageSquare,
    label: 'Mock Interview',
    path: '/candidate/mock-interview',
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

  const { data: savedJobs = [] } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: () => getSavedJobs(),
    enabled: isInitialized && !!user && user.roleResponse?.name === RoleUser.CANDIDATE,
  })

  const { data: appliedJobs = [] } = useQuery({
    queryKey: ['appliedJobs'],
    queryFn: () => getMyApplications(),
    enabled: isInitialized && !!user && user.roleResponse?.name === RoleUser.CANDIDATE,
  })

  const navItems = candidateNavItems.map((item) => {
    if (item.path === '/candidate/saved-jobs') {
      return { ...item, badge: savedJobs.length }
    }
    if (item.path === '/candidate/applied-jobs') {
      return { ...item, badge: appliedJobs.length }
    }
    return item
  })

  if (!isInitialized || !user || user.roleResponse?.name !== RoleUser.CANDIDATE) {
    return null
  }

  return (
    <div className="bg-slate-50/50 flex flex-col min-h-[calc(100vh-64px)]" id="candidate-root">
      <div className="flex flex-1">
        <Sidebar items={navItems} title="Ứng viên" accentColor="blue" />
        <main className="flex-1 p-6 lg:p-8 overflow-auto" id="candidate-content">
          {children}
        </main>
      </div>
    </div>
  )
}
