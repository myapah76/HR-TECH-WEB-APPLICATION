'use client'
import Sidebar from '@/src/components/layout/Sidebar'
import {
  LayoutDashboard,
  UserCircle,
  FileText,
  FolderOpen,
  Heart,
  Send,
  Bell as BellIcon,
  Settings,
  Brain,
  BellRing,
  Star,
} from 'lucide-react'

const candidateNavItems = [
  {
    icon: LayoutDashboard,
    label: 'Tổng quan',
    path: '/candidate',
  },
  { icon: UserCircle, label: 'Hồ sơ cá nhân', path: '/candidate/profile' },
  {
    icon: FileText,
    label: 'Tạo CV Online',
    path: '/candidate/resume-builder',
  },
  { icon: FolderOpen, label: 'Quản lý CV', path: '/candidate/cv' },
  { icon: Star, label: 'Gợi ý Việc làm', path: '/candidate/recommend-jobs' },
  {
    icon: Heart,
    label: 'Việc đã lưu',
    path: '/candidate/saved-jobs',
    badge: 5,
  },
  {
    icon: Send,
    label: 'Việc đã ứng tuyển',
    path: '/candidate/applied-jobs',
    badge: 3,
  },
  {
    icon: BellRing,
    label: 'Thông báo việc làm',
    path: '/candidate/job-alerts',
  },
  {
    icon: BellIcon,
    label: 'Thông báo',
    path: '/candidate/notifications',
    badge: 2,
  },
  {
    icon: Brain,
    label: 'AI Cố vấn nghề',
    path: '/candidate/ai-advisor',
  },
  { icon: Settings, label: 'Cài đặt', path: '/candidate/settings' },
]

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-50/50 flex flex-col min-h-[calc(100vh-64px)]" id="candidate-root">
      <div className="flex flex-1">
        <Sidebar
          items={candidateNavItems}
          title="Ứng viên"
          accentColor="blue"
        />
        <main className="flex-1 p-6 lg:p-8 overflow-auto" id="candidate-content">
          {children}
        </main>
      </div>
    </div>
  )
}
