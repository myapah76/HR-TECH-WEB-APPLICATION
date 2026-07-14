'use client'

import { Briefcase, Building2, UserCheck, Send, Sparkles, FileUp, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGetLandingStats } from '@/src/hooks/job'

export default function MarketStats() {
  const router = useRouter()

  const { data, isLoading } = useGetLandingStats()

  const stats = [
    {
      label: 'Việc làm IT đang tuyển',
      value: data?.totalJobs ?? 0,
      icon: <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/20',
    },
    {
      label: 'Nhà tuyển dụng xác thực',
      value: data?.totalCompanies ?? 0,
      icon: <Building2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      iconBg:
        'bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/20',
    },
    {
      label: 'Lượt ứng tuyển thành công',
      value: data?.totalApplications ?? 0,
      icon: <UserCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-450" />,
      iconBg:
        'bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/20',
    },
  ]

  return (
    <section
      className="bg-slate-50/30 dark:bg-slate-900/10 py-16 border-b border-slate-100 dark:border-slate-800/60 transition-colors"
      id="market-stats-newsletter-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top: Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group flex items-center gap-5 p-6 bg-white rounded-3xl border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md hover:-translate-y-1 hover:border-blue-500/40 transition-all duration-300 cursor-pointer"
            >
              <div
                className={`p-3.5 rounded-2xl flex items-center justify-center shrink-0 ${stat.iconBg}`}
              >
                {stat.icon}
              </div>
              <div className="flex-1 min-w-0">
                {isLoading ? (
                  <div className="h-7 w-20 bg-slate-200/80 rounded-lg animate-pulse" />
                ) : (
                  <p className="text-2.5xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    {stat.value.toLocaleString()}+
                  </p>
                )}
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: Combined AI Scan & Newsletter CTA Banner */}
        <div
          className="relative rounded-3xl overflow-hidden bg-radial from-amber-900/90 via-amber-950 to-neutral-900 p-8 sm:p-10 shadow-xl border border-amber-800 max-w-5xl mx-auto"
          id="newsletter-banner"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(146, 64, 14, 0.95) 0%, rgba(24, 24, 27, 0.98) 100%)`,
          }}
        >
          {/* Subtle mesh background detail */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] bg-size-[16px_16px]"></div>

          <div
            className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-amber-800/40"
            id="newsletter-content"
          >
            {/* Left Column: AI CV Scanner */}
            <div className="flex flex-col items-start justify-between space-y-4 text-left pb-6 md:pb-0">
              <div>
                <span className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest text-amber-300 uppercase px-2 py-0.5 rounded-md bg-amber-950 border border-amber-800">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  {'CÔNG NGHỆ A.I ĐỘT PHÁ'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-rose-100 tracking-tight leading-snug mt-3">
                  {'Tải lên CV & Quét A.I tức thì'}
                </h3>
                <p className="text-xs text-amber-200/70 mt-2 leading-relaxed">
                  {
                    'Nexus HR tự động phân tích hồ sơ và so khớp tức thì với hàng ngàn cơ hội việc làm IT chất lượng cao.'
                  }
                </p>
              </div>

              <button
                onClick={() => router.push('/candidate/ai-advisor')}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-450 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl shadow-lg active:scale-98 transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <FileUp className="h-4 w-4" />
                <span>{'TẢI LÊN CV NGAY'}</span>
              </button>
            </div>

            {/* Right Column: Register/Subscribe */}
            <div className="flex flex-col items-start justify-between space-y-4 text-left pt-6 md:pt-0 md:pl-8">
              <div>
                <span className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest text-amber-300 uppercase px-2 py-0.5 rounded-md bg-amber-950 border border-amber-800">
                  <Bell className="h-3 w-3 text-amber-400" />
                  {'BẢN TIN VIỆC LÀM'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-rose-100 tracking-tight leading-snug mt-3">
                  {'Theo dõi cơ hội việc làm IT mới'}
                </h3>
                <p className="text-xs text-amber-200/70 mt-2 leading-relaxed">
                  {
                    'Đăng ký tài khoản để không bỏ lỡ các bản tin tuyển dụng hot và phân tích xu hướng IT mới nhất.'
                  }
                </p>
              </div>

              <button
                onClick={() => router.push('/register')}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-450 text-white font-black text-xs uppercase tracking-widest py-3 px-6 rounded-xl shadow-lg active:scale-98 transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 mt-4 border border-amber-400/20"
              >
                <Send className="h-4 w-4" />
                <span>{'ĐĂNG KÝ TÀI KHOẢN'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
