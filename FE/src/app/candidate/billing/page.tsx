'use client'

import React from 'react'
import { CurrentPlanCard } from '@/src/components/billing/CurrentPlanCard'
import { PaymentHistoryTable } from '@/src/components/billing/PaymentHistoryTable'
import { useMyCurrentSubscriptionQuery } from '@/src/hooks/subscription'
import { useMyPaymentHistoryQuery } from '@/src/hooks/payment'
import { useAuthStore } from '@/src/stores/auth.store'
import PageHeader from '@/src/components/ui/PageHeader'

export default function CandidateBillingPage() {
  const { user } = useAuthStore()
  
  const { data: subRes, isLoading: isSubLoading } = useMyCurrentSubscriptionQuery(!!user)
  const { data: paymentRes, isLoading: isPaymentLoading, refetch } = useMyPaymentHistoryQuery(0, 50) // Load max 50 recent payments for now

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <PageHeader
        title="Quản lý Gói dịch vụ"
        subtitle="Theo dõi gói đăng ký hiện tại và lịch sử thanh toán của bạn."
      />

      <CurrentPlanCard subscription={subRes} isLoading={isSubLoading} />

      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Lịch sử giao dịch</h2>
        <PaymentHistoryTable payments={paymentRes?.content || []} isLoading={isPaymentLoading} refetchHistory={refetch} />
      </div>
    </div>
  )
}
