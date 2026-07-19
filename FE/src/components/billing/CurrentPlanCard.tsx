'use client'

import React from 'react'
import { 
  MySubscriptionResponse, 
  SubFeatureUsageResponse,
  CurrentPlanCardProps,
  CardHeaderProps,
  RenewalAlertsProps,
  WalletSectionProps,
  RateLimitSectionProps,
  StandardFeaturesSectionProps,
  ResetType
} from '@/src/types/subscription'
import Link from 'next/link'
import { formatDate } from '@/src/utils'
import dayjs from 'dayjs'
import { Sparkles, Briefcase, Activity, Clock, ShieldCheck, Check, AlertTriangle, AlertCircle } from 'lucide-react'

// 1. Loading Skeleton Component
const CurrentPlanSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 animate-pulse">
    <div className="h-6 w-32 bg-slate-200 rounded-lg mb-4"></div>
    <div className="h-8 w-48 bg-slate-200 rounded-lg mb-8"></div>
    <div className="space-y-4">
      <div className="h-4 w-full bg-slate-100 rounded"></div>
      <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
    </div>
  </div>
)

// 2. Free Plan Banner Component
const FreePlanBanner: React.FC = () => (
  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-10 text-white shadow-lg shadow-indigo-500/20 mb-8 relative overflow-hidden">
    <div className="absolute top-0 right-0 p-8 opacity-10">
      <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.644 1.59a.75.75 0 01.712 0l9.75 5.25v10.32a.75.75 0 01-.387.653l-9.75 5.25a.75.75 0 01-.712 0l-9.75-5.25A.75.75 0 011.125 17.16V6.84a.75.75 0 01.387-.653l9.75-5.25z" />
      </svg>
    </div>

    <div className="relative z-10">
      <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/10 mb-4">
        Gói Miễn Phí
      </span>
      <h2 className="text-3xl font-bold mb-4 tracking-tight">Trải nghiệm các tính năng cao cấp</h2>
      <p className="text-indigo-100 text-lg mb-8 max-w-xl leading-relaxed">
        Nâng cấp tài khoản của bạn để truy cập hàng loạt tính năng ưu việt, tăng cường hiệu quả tuyển dụng và tìm kiếm việc làm ngay hôm nay.
      </p>
      <Link href="/pricing">
        <button className="bg-white text-indigo-600 hover:bg-slate-50 transition-colors font-semibold px-8 py-3.5 rounded-xl shadow-sm cursor-pointer">
          Khám phá các gói dịch vụ
        </button>
      </Link>
    </div>
  </div>
)

// 3. Card Header Component
const CardHeader: React.FC<CardHeaderProps> = ({ planName, startDate, endDate }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{planName}</h2>
        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          Đang hoạt động
        </span>
      </div>
      <p className="text-slate-500 text-sm">
        Có hiệu lực từ {formatDate(startDate)} đến <span className="font-medium text-slate-700">{formatDate(endDate)}</span>
      </p>
    </div>
    <Link href="/pricing">
      <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium px-5 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer">
        Thay đổi gói
      </button>
    </Link>
  </div>
)

// 4. Renewal Alerts Component
const RenewalAlerts: React.FC<RenewalAlertsProps> = ({ subscription }) => {
  const now = dayjs();
  const endDate = dayjs(subscription.endDate);
  const isExpired = now.isAfter(endDate);
  const daysLeft = endDate.diff(now, 'day');
  const isExpiringSoon = !isExpired && daysLeft <= 3 && daysLeft >= 0;
  const isOutOfTokens = (subscription.aiCreditBalance ?? 0) <= 0;

  if (isExpired) {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-800 text-sm">Gói đăng ký đã hết hạn!</h4>
            <p className="text-xs text-rose-650 mt-0.5">
              Gói {subscription.planName} của bạn đã hết hạn vào ngày {formatDate(subscription.endDate)}. Hãy gia hạn hoặc nâng cấp để tiếp tục sử dụng các tính năng.
            </p>
          </div>
        </div>
        <Link href="/pricing">
          <button className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm shadow-rose-600/10 whitespace-nowrap">
            Gia hạn ngay
          </button>
        </Link>
      </div>
    );
  }

  if (isOutOfTokens) {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">Hết Năng lượng AI!</h4>
            <p className="text-xs text-amber-650 mt-0.5">
              Số dư Năng lượng AI của bạn đã hết (0 Credit). Gia hạn gói hiện tại hoặc nâng cấp gói mới để tiếp tục sử dụng các tính năng AI.
            </p>
          </div>
        </div>
        <Link href="/pricing">
          <button className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm shadow-amber-600/10 whitespace-nowrap">
            Gia hạn / Nâng cấp
          </button>
        </Link>
      </div>
    );
  }

  if (isExpiringSoon) {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-800 text-sm">Gói sắp hết hạn!</h4>
            <p className="text-xs text-amber-650 mt-0.5">
              Gói {subscription.planName} của bạn sẽ hết hạn sau {daysLeft === 0 ? 'hôm nay' : `${daysLeft} ngày`} (vào ngày {formatDate(subscription.endDate)}). Gia hạn sớm để không bị gián đoạn.
            </p>
          </div>
        </div>
        <Link href="/pricing">
          <button className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm shadow-amber-600/10 whitespace-nowrap">
            Gia hạn ngay
          </button>
        </Link>
      </div>
    );
  }

  return null;
}

// 5. Wallet Section Component
const WalletSection: React.FC<WalletSectionProps> = ({ wallets, subscription }) => {
  if (wallets.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số dư tích lũy trọn đời</h3>
      <div className={`grid grid-cols-1 ${wallets.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
        {wallets.map((feature) => {
          const isAiCredit = feature.featureCode === 'AI_CREDIT';
          const balanceValue = isAiCredit 
            ? (subscription.aiCreditBalance ?? 0) 
            : (subscription.jobPostBalance ?? 0);
          
          return (
            <div key={feature.featureCode} className="bg-slate-50/50 rounded-2xl p-6 border-l-4 border-indigo-650 border-y border-r border-slate-100/80 shadow-xs flex items-center justify-between gap-4 transition-all hover:shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl">
                  {isAiCredit ? <Sparkles className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{feature.featureName}</h4>
                  <p className="text-2xl font-black text-slate-800 mt-1">
                    {new Intl.NumberFormat('vi-VN').format(balanceValue)}
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Ví trọn đời
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

// 6. Rate Limit Section Component
const RateLimitSection: React.FC<RateLimitSectionProps> = ({ rateLimitFeatures }) => {
  if (rateLimitFeatures.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hạn mức giới hạn theo chu kỳ</h3>
      <div className={`grid grid-cols-1 ${rateLimitFeatures.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
        {rateLimitFeatures.map((feature) => (
          <div key={feature.featureCode} className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-50 text-indigo-650 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-800">{feature.featureName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feature.rateLimits?.map((limit, idx) => {
                const limPercentage = Math.min(100, Math.round((limit.used / limit.capQuota) * 100))
                const limNear = limPercentage >= 80
                return (
                  <div key={idx} className="bg-slate-50/50 rounded-xl p-4 border border-slate-100/50 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                          {limit.resetType === 'DAILY' ? 'Trong ngày' : 'Trong tuần'}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          <span className={limNear ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>{limit.used}</span>
                          <span className="text-slate-400"> / {limit.capQuota} credits</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden my-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${limNear ? 'bg-rose-500' : 'bg-indigo-600'}`}
                          style={{ width: `${limPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-end">
                        <span className={`text-[9px] font-bold ${
                          limPercentage >= 100 ? 'text-rose-600' : limNear ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {limPercentage >= 100 ? 'Đã hết' : limNear ? 'Sắp hết' : `Còn ${100 - limPercentage}%`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400 mt-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Reset: {dayjs(limit.lastResetDate).add(limit.resetType === 'DAILY' ? 1 : 7, 'day').format('HH:mm - DD/MM/YYYY')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 7. Standard Features Section Component
const StandardFeaturesSection: React.FC<StandardFeaturesSectionProps> = ({ standardFeatures }) => {
  if (standardFeatures.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quyền lợi và chức năng khả dụng</h3>
      <div className="bg-slate-50/30 rounded-2xl p-6 border border-slate-100/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {standardFeatures.map((feature) => (
            <div key={feature.featureCode} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-3 h-3" strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold text-slate-650">
                {feature.featureName}
                {feature.aiCreditCost > 0 && (
                  <span className="text-[11px] text-rose-500 font-bold ml-1">({feature.aiCreditCost} credits/lượt)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Component
export const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({ subscription, isLoading }) => {
  if (isLoading) {
    return <CurrentPlanSkeleton />
  }

  if (!subscription) {
    return <FreePlanBanner />
  }

  const wallets = [];
  if (subscription.aiCreditBalance !== undefined && subscription.aiCreditBalance >= 0) {
    wallets.push({
      featureCode: 'AI_CREDIT',
      featureName: 'Năng lượng AI',
      aiCreditCost: 0
    });
  }
  // Only display job posting if it is greater than 0
  if (subscription.jobPostBalance !== undefined && subscription.jobPostBalance > 0) {
    wallets.push({
      featureCode: 'JOB_POSTING',
      featureName: 'Số tin tuyển dụng',
      aiCreditCost: 0
    });
  }

  const rateLimitFeatures = [];
  const aiCreditRateLimits = [];
  if (subscription.dailyAiLimit !== undefined && subscription.dailyAiLimit > 0) {
    aiCreditRateLimits.push({
      resetType: ResetType.DAILY,
      capQuota: subscription.dailyAiLimit,
      used: subscription.dailyAiUsage || 0,
      lastResetDate: subscription.lastDailyReset || subscription.startDate,
    });
  }
  if (subscription.weeklyAiLimit !== undefined && subscription.weeklyAiLimit > 0) {
    aiCreditRateLimits.push({
      resetType: ResetType.WEEKLY,
      capQuota: subscription.weeklyAiLimit,
      used: subscription.weeklyAiUsage || 0,
      lastResetDate: subscription.lastWeeklyReset || subscription.startDate,
    });
  }

  if (aiCreditRateLimits.length > 0) {
    rateLimitFeatures.push({
      featureCode: 'AI_CREDIT_RATE_LIMIT',
      featureName: 'Giới hạn sử dụng AI',
      rateLimits: aiCreditRateLimits,
    });
  }

  const standardFeatures = subscription.featuresUsage?.filter(feature => 
    !['AI_CREDIT', 'JOB_POSTING'].includes(feature.featureCode)
  ) || [];

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
      <CardHeader 
        planName={subscription.planName} 
        startDate={subscription.startDate} 
        endDate={subscription.endDate} 
      />
      
      <RenewalAlerts subscription={subscription} />

      {(wallets.length > 0 || rateLimitFeatures.length > 0 || standardFeatures.length > 0) && (
        <div className="space-y-8 pt-6 border-t border-slate-100">
          <WalletSection wallets={wallets} subscription={subscription} />
          <RateLimitSection rateLimitFeatures={rateLimitFeatures} />
          <StandardFeaturesSection standardFeatures={standardFeatures} />
        </div>
      )}
    </div>
  )
}
