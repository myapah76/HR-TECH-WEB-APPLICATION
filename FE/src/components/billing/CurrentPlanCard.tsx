'use client'

import React from 'react'
import { MySubscriptionResponse } from '@/src/types/subscription'
import Link from 'next/link'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'
import { formatDate } from '@/src/lib/utils'
import dayjs from 'dayjs'

interface CurrentPlanCardProps {
  subscription: MySubscriptionResponse | undefined
  isLoading: boolean
}

export const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({ subscription, isLoading }) => {
  const { user } = useAuthStore()

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-lg mb-4"></div>
        <div className="h-8 w-48 bg-slate-200 rounded-lg mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-slate-100 rounded"></div>
          <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
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
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{subscription.planName}</h2>
            <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              Đang hoạt động
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Có hiệu lực từ {formatDate(subscription.startDate)} đến <span className="font-medium text-slate-700">{formatDate(subscription.endDate)}</span>
          </p>
        </div>
        <Link href="/pricing">
          <button className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium px-5 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer">
            Thay đổi gói
          </button>
        </Link>
      </div>

      {(() => {
        const filteredFeatures = subscription.featuresUsage?.filter(feature => {
          const nameLower = feature.featureName.toLowerCase();
          if (user?.roleResponse?.name === RoleUser.CANDIDATE) {
            return nameLower.includes('năng lượng ai');
          }
          if (user?.roleResponse?.name === RoleUser.RECRUITER) {
            return nameLower.includes('năng lượng ai') || nameLower.includes('tin') || nameLower.includes('đăng');
          }
          return true;
        }) || [];

        if (filteredFeatures.length === 0) return null;

        return (
          <div className={`grid grid-cols-1 ${filteredFeatures.length > 1 ? 'md:grid-cols-2' : ''} gap-6 pt-6 border-t border-slate-100`}>
            {filteredFeatures.map((feature) => {
              const percentage = Math.min(100, Math.round((feature.used / feature.quota) * 100))
              const isNearLimit = percentage >= 80
              
              return (
                <div key={feature.featureCode} className="bg-slate-50 rounded-2xl p-5 border border-slate-100/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-slate-700">{feature.featureName}</span>
                    <span className="text-sm font-medium text-slate-500">
                      <span className={isNearLimit ? 'text-rose-600' : 'text-slate-800'}>{feature.used}</span> / {feature.quota}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isNearLimit ? 'bg-rose-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  {isNearLimit && (
                    <p className="text-xs text-rose-500 mt-2 font-medium">Bạn sắp sử dụng hết lượt tính năng này.</p>
                  )}

                  {feature.rateLimits && feature.rateLimits.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-slate-200/60 pt-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Định mức sử dụng</p>
                      {feature.rateLimits.map((limit, idx) => {
                        const limPercentage = Math.min(100, Math.round((limit.used / limit.capQuota) * 100))
                        const limNear = limPercentage >= 80
                        return (
                          <div key={idx} className="bg-white rounded-lg p-2.5 border border-slate-100 shadow-sm text-sm">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-slate-600 font-medium text-xs">
                                {limit.resetType === 'DAILY' ? 'Trong ngày' : 'Trong tuần'}
                              </span>
                              <span className="text-xs font-semibold">
                                <span className={limNear ? 'text-rose-600' : 'text-slate-700'}>{limit.used}</span> / {limit.capQuota}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${limNear ? 'bg-rose-400' : 'bg-indigo-400'}`}
                                style={{ width: `${limPercentage}%` }}
                              ></div>
                            </div>
                            <div className="text-[10px] text-slate-400 text-right">
                              Sẽ reset vào: {dayjs(limit.lastResetDate).add(limit.resetType === 'DAILY' ? 1 : 7, 'day').format('HH:mm - DD/MM/YYYY')}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        );
      })()}
    </div>
  )
}
