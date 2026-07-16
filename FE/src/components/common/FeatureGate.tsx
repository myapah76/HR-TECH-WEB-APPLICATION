'use client'

import Link from 'next/link'
import { Lock, Sparkles, ArrowRight, Crown, Zap } from 'lucide-react'

import { useSubscriptionAccess } from '@/src/hooks/subscription'
import { useAuthStore } from '@/src/stores/auth.store'

interface FeatureGateProps {
  featureName: string
  featureDescription: string
  icon?: React.ReactNode
  children?: React.ReactNode
  /** If true, shows a blurred preview of children behind the gate */
  showPreview?: boolean
  theme?: 'candidate' | 'recruiter'
}

/**
 * FeatureGate – Hiển thị khi người dùng ở gói thấp hơn cố truy cập tính năng Premium.
 * KHÔNG ẩn tính năng mà hiển thị UI "khóa" + nút đăng ký.
 */
export function FeatureGate({
  featureName,
  featureDescription,
  icon,
  children,
  showPreview = true,
  theme,
}: FeatureGateProps) {
  const { planName } = useSubscriptionAccess()
  const { user } = useAuthStore()

  // Determine theme styling dynamically based on user role or theme prop
  const isRecruiter = theme === 'recruiter' || (!theme && user?.roleResponse?.name === 'RECRUITER')

  const colors = isRecruiter
    ? {
        glowOrb: 'from-emerald-500/30 to-teal-650/30',
        mainOrb: 'from-emerald-500 to-teal-600 shadow-emerald-500/40',
        tag: 'bg-emerald-50 border-emerald-200/60 text-emerald-600',
        benefitIconBg: 'from-emerald-500 to-teal-600',
        primaryBtn: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30 hover:shadow-emerald-500/50',
        secondaryBtn: 'border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-750 hover:bg-emerald-50/50',
      }
    : {
        glowOrb: 'from-blue-500/30 to-blue-600/30',
        mainOrb: 'from-blue-500 to-blue-700 shadow-blue-500/40',
        tag: 'bg-blue-50 border-blue-200/60 text-blue-600',
        benefitIconBg: 'from-blue-500 to-blue-600',
        primaryBtn: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30 hover:shadow-blue-500/50',
        secondaryBtn: 'border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 hover:bg-blue-50/50',
      }

  return (
    <div className="relative w-full min-h-[500px] flex flex-col" id="feature-gate-container">
      {/* Blurred preview background */}
      {showPreview && children && (
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none select-none" aria-hidden>
          <div className="blur-sm opacity-30 scale-95 origin-top">{children}</div>
        </div>
      )}

      {/* Gate overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-16 text-center">
        {/* Glowing orb */}
        <div className="relative mb-8">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.glowOrb} blur-2xl scale-150 animate-pulse`} />
          <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${colors.mainOrb} flex items-center justify-center shadow-2xl`}>
            {icon ?? <Lock className="w-10 h-10 text-white" />}
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-lg border-2 border-white">
            <Crown className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Text */}
        <div className="max-w-md space-y-3 mb-8">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${colors.tag}`}>
            <Sparkles className="w-3 h-3" />
            Tính năng Premium
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{featureName}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{featureDescription}</p>
        </div>

        {/* Benefits list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 max-w-xl w-full">
          {[
            { icon: Zap, text: 'Kết quả trong vài giây' },
            { icon: Sparkles, text: 'Phân tích bởi AI tiên tiến' },
            { icon: Crown, text: 'Ưu tiên trong danh sách' },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200/60 rounded-xl shadow-xs"
            >
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${colors.benefitIconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-600">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link
            href="/pricing"
            id="feature-gate-upgrade-btn"
            className={`inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r ${colors.primaryBtn} text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 text-sm`}
          >
            <Crown className="w-4 h-4" />
            Nâng cấp gói ngay
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            id="feature-gate-view-plans-btn"
            className={`inline-flex items-center gap-2 px-6 py-3.5 bg-white border ${colors.secondaryBtn} font-semibold rounded-xl transition-all duration-200 text-sm`}
          >
            Xem tất cả gói dịch vụ
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Bạn đang dùng gói{' '}
          <span className="font-bold text-slate-500">{planName || 'Cơ Bản'}</span>. Nâng cấp để mở khóa toàn bộ tính năng AI.
        </p>
      </div>
    </div>
  )
}


