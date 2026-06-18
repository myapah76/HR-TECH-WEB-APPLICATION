'use client'

import Link from 'next/link'
import StatCard from '@/src/components/ui/StatCard'
import { Briefcase, Eye, Heart, Send, FileText, Brain, Clock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/src/stores/auth.store'
import { useGetSavedJobs } from '@/src/hooks/job/job.hooks'
import { getMyApplications } from '@/src/services/application.service'
import { useQuery } from '@tanstack/react-query'

export default function CandidateDashboardPage() {
  const { user } = useAuthStore()
  const { data: savedJobs = [] } = useGetSavedJobs()

  const { data: appliedJobs = [] } = useQuery({
    queryKey: ['appliedJobs'],
    queryFn: () => getMyApplications(),
  })

  const recentActivity = [
    { action: 'Ứng tuyển vị trí Senior Golang Dev', time: '2h', status: 'submitted' },
    { action: 'Nhà tuyển dụng FPT xem hồ sơ', time: '5h', status: 'viewed' },
    { action: 'CV khớp 97% với React Native Lead', time: '1d', status: 'matched' },
    { action: 'Lưu việc: DevOps Engineer tại VNG', time: '2d', status: 'saved' },
  ]

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">
          Chào mừng, {user?.firstName || 'Ứng viên'}!
        </h1>
        <p className="text-base text-slate-500 font-medium mt-1">
          Tổng quan hoạt động tài khoản ứng viên
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Send}
          label="Đã ứng tuyển"
          value={appliedJobs.length}
          change={50}
          color="blue"
        />
        <StatCard icon={Eye} label="Lượt xem hồ sơ" value={28} change={12} color="emerald" />
        <StatCard icon={Heart} label="Việc đã lưu" value={savedJobs.length} color="rose" />
        <StatCard icon={Briefcase} label="Việc phù hợp A.I" value={14} change={8} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-slate-900">Hoạt động gần đây</h2>
            <Link
              href="/candidate/applied-jobs"
              className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    item.status === 'submitted'
                      ? 'bg-blue-50 text-blue-600'
                      : item.status === 'viewed'
                        ? 'bg-emerald-50 text-emerald-600'
                        : item.status === 'matched'
                          ? 'bg-violet-50 text-violet-600'
                          : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {item.status === 'submitted' ? (
                    <Send className="h-4.5 w-4.5" />
                  ) : item.status === 'viewed' ? (
                    <Eye className="h-4.5 w-4.5" />
                  ) : item.status === 'matched' ? (
                    <Brain className="h-4.5 w-4.5" />
                  ) : (
                    <Heart className="h-4.5 w-4.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{item.action}</p>
                  <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="h-4 w-4" />
                    {item.time} trước
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-3">Thao tác nhanh</h3>
            <div className="space-y-2">
              <Link
                href="/candidate/resume-builder"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">
                  Tạo CV mới
                </span>
              </Link>
              <Link
                href="/candidate/ai-advisor"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 transition-colors group"
              >
                <Brain className="h-5 w-5 text-violet-600" />
                <span className="text-sm font-bold text-slate-700 group-hover:text-violet-600">
                  Quét CV bằng A.I
                </span>
              </Link>
              <Link
                href="/jobs"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors group"
              >
                <Briefcase className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600">
                  Tìm việc làm
                </span>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
            <h3 className="text-base font-black">Hoàn thiện hồ sơ</h3>
            <p className="text-sm font-medium text-blue-100 mt-1">
              Hồ sơ hoàn chỉnh tăng 3x cơ hội nhận việc
            </p>
            <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs font-bold text-blue-200 mt-1.5">65% hoàn thành</p>
            <Link
              href="/candidate/profile"
              className="mt-3 inline-block bg-white text-blue-700 font-black text-sm py-2.5 px-5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Cập nhật ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
