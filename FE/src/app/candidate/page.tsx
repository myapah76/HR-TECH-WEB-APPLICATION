'use client'

import Link from 'next/link'
import StatCard from '@/src/components/ui/StatCard'
import { Briefcase, Eye, Heart, Send, FileText, Brain, Clock, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/src/stores/auth.store'
import { useGetSavedJobs } from '@/src/hooks/job'
import { useGetMyApplications } from '@/src/hooks/application'
import { useGetAllCvs } from '@/src/hooks/cv'
import { useRecommendJobsForCv } from '@/src/hooks/recommendation'

const getRelativeTime = (dateStr: string | number | Date) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0) return 'Vừa xong'
  
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${Math.max(1, diffMins)} phút`
  if (diffHours < 24) return `${diffHours} giờ`
  return `${diffDays} ngày`
}

export default function CandidateDashboardPage() {
  const { user } = useAuthStore()
  const { data: savedJobs = [] } = useGetSavedJobs()
  const { data: appliedJobs = [] } = useGetMyApplications()
  
  // AI recommendations count integration
  const { data: cvs = [] } = useGetAllCvs()
  const primaryCv = cvs.find((c) => c.isPrimary) || cvs[0]
  const { data: recommendedJobs = [] } = useRecommendJobsForCv(primaryCv?.id || '', 10, !!primaryCv?.id)

  // Combined recent activities from API data
  const appliedActivities = appliedJobs.map((app) => ({
    action: `Ứng tuyển vị trí ${app.jobTitle}`,
    date: new Date(app.appliedAt),
    status: 'submitted',
  }))

  const savedActivities = savedJobs.map((job) => ({
    action: `Lưu việc làm: ${job.title} tại ${job.companyName || 'Nhà tuyển dụng'}`,
    date: new Date(job.createdAt || new Date()),
    status: 'saved',
  }))

  const recentActivity = [...appliedActivities, ...savedActivities]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4)

  // Calculate profile completeness percentage
  const calculateCompleteness = () => {
    if (!user) return 0
    const fields = [
      user.firstName,
      user.lastName,
      user.phone,
      user.address,
      user.avatarUrl,
      user.dateOfBirth,
    ]
    const filledFields = fields.filter((f) => !!f && f.toString().trim() !== '')
    return Math.round((filledFields.length / fields.length) * 100)
  }

  const completeness = calculateCompleteness()

  return (
    <div className="max-w-6xl">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Send}
          label="Đã ứng tuyển"
          value={appliedJobs.length}
          color="blue"
        />
        <StatCard icon={Eye} label="Lượt xem hồ sơ" value={28} change={12} color="emerald" />
        <StatCard icon={Heart} label="Việc đã lưu" value={savedJobs.length} color="rose" />
        <StatCard icon={Briefcase} label="Việc phù hợp A.I" value={recommendedJobs.length} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-slate-900">Hoạt động gần đây</h2>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      item.status === 'submitted'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-rose-50 text-rose-605'
                    }`}
                  >
                    {item.status === 'submitted' ? (
                      <Send className="h-4.5 w-4.5" />
                    ) : (
                      <Heart className="h-4.5 w-4.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{item.action}</p>
                    <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                      <Clock className="h-4 w-4" />
                      {getRelativeTime(item.date)} trước
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm font-semibold text-slate-405">
                Chưa có hoạt động gần đây
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-3">Thao tác nhanh</h3>
            <div className="space-y-2">
              <Link
                href="/candidate/cv"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">
                  Quản lý CV
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

          <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
            <h3 className="text-base font-black">Hoàn thiện hồ sơ</h3>
            <p className="text-sm font-medium text-blue-100 mt-1">
              Hồ sơ hoàn chỉnh tăng 3x cơ hội nhận việc
            </p>
            <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: `${completeness}%` }}></div>
            </div>
            <p className="text-xs font-bold text-blue-200 mt-1.5">{completeness}% hoàn thành</p>
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

