'use client'

import Link from 'next/link'
import StatCard from '@/src/components/ui/StatCard'
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Clock,
  Brain,
  BarChart3,
  Search,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '@/src/stores/auth.store'

export default function RecruiterDashboardPage() {
  const { user } = useAuthStore()
  
  const recentActivities = [
    { action: '5 ứng viên mới ứng tuyển Golang Dev', time: '1 giờ trước', status: 'new' },
    { action: 'Tin tuyển dụng React Native đã hết hạn', time: '3 giờ trước', status: 'expired' },
    { action: 'Ứng viên Nguyễn Hoàng Nam phù hợp A.I 95%', time: '1 ngày trước', status: 'ai_match' },
    { action: 'Đã cập nhật thông tin công ty thành công', time: '2 ngày trước', status: 'update' },
  ]

  const candidatePipeline = [
    { stage: 'Ứng tuyển mới', count: 18, percentage: 38, color: 'bg-blue-500' },
    { stage: 'Sàng lọc CV', count: 12, percentage: 25, color: 'bg-amber-500' },
    { stage: 'Phỏng vấn', count: 9, percentage: 19, color: 'bg-indigo-500' },
    { stage: 'Nhận việc (Offer)', count: 8, percentage: 18, color: 'bg-emerald-500' },
  ]

  return (
    <div className="max-w-6xl space-y-8 animate-fade-in">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Chào, {user?.firstName || user?.email || 'Nhà tuyển dụng'}!
          </h1>
          <p className="text-base text-slate-500 font-medium mt-1">
            Tổng quan hoạt động tuyển dụng và hiệu suất tin đăng của công ty bạn
          </p>
        </div>
        <Link
          href="/company/post-job"
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Đăng tin mới</span>
        </Link>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Tin đang tuyển" value={8} change={25} color="blue" />
        <StatCard icon={Users} label="Đơn ứng tuyển" value={47} change={18} color="emerald" />
        <StatCard icon={Eye} label="Lượt xem tin" value="2.4K" change={12} color="violet" />
        <StatCard icon={TrendingUp} label="Tỷ lệ tuyển" value="68%" change={5} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities (Left 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Logs */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-900">Hoạt động gần đây</h2>
              <Link
                href="/company/applications"
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3.5">
              {recentActivities.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      r.status === 'new'
                        ? 'bg-blue-50 text-blue-600'
                        : r.status === 'expired'
                          ? 'bg-rose-50 text-rose-600'
                          : r.status === 'ai_match'
                            ? 'bg-violet-50 text-violet-600'
                            : 'bg-slate-100 text-slate-650'
                    }`}
                  >
                    {r.status === 'new' ? (
                      <Users className="h-5 w-5" />
                    ) : r.status === 'expired' ? (
                      <Briefcase className="h-5 w-5" />
                    ) : r.status === 'ai_match' ? (
                      <Brain className="h-5 w-5" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{r.action}</p>
                    <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                      <Clock className="h-4 w-4" />
                      {r.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Pipeline Visualizer */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
            <h2 className="text-lg font-black text-slate-900 mb-5">Phễu ứng viên</h2>
            <div className="space-y-4">
              {candidatePipeline.map((p, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-700">{p.stage}</span>
                    <span className="font-black text-slate-800">
                      {p.count} hồ sơ{' '}
                      <span className="text-xs font-semibold text-slate-450">({p.percentage}%)</span>
                    </span>
                  </div>
                  <div className="bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${p.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Tips (Right 1/3) */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs">
            <h3 className="text-base font-black text-slate-900 mb-4">Thao tác nhanh</h3>
            <div className="space-y-2">
              <Link
                href="/company/post-job"
                className="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-emerald-50 transition-colors group"
              >
                <PlusCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-750 group-hover:text-emerald-700 transition-colors">
                  Đăng tin tuyển dụng mới
                </span>
              </Link>
              <Link
                href="/company/search"
                className="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <Search className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-bold text-slate-750 group-hover:text-blue-700 transition-colors">
                  Tìm ứng viên tiềm năng
                </span>
              </Link>
              <Link
                href="/company/analytics"
                className="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-violet-50 transition-colors group"
              >
                <BarChart3 className="h-5 w-5 text-violet-600" />
                <span className="text-sm font-bold text-slate-750 group-hover:text-violet-700 transition-colors">
                  Báo cáo thống kê
                </span>
              </Link>
            </div>
          </div>

          {/* Premium HR Matching Widget */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            {/* Background absolute decor */}
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
              <Brain className="w-36 h-36" />
            </div>

            <div className="relative z-10 space-y-4">
              <div>
                <span className="bg-white/20 text-white text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full uppercase">
                  A.I Matching
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black leading-tight">Tuyển dụng bằng Graph AI</h3>
                <p className="text-xs font-semibold text-emerald-100/90 mt-1 leading-relaxed">
                  Trải nghiệm công nghệ đối sánh đồ thị của HR-Tech giúp tìm thấy kỹ năng ẩn và
                  match ứng viên chính xác tới 98%.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/company/search"
                  className="inline-flex items-center justify-center gap-1.5 bg-white text-emerald-700 font-black text-xs py-2.5 px-4 rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-sm"
                >
                  <span>Thử nghiệm ngay</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
