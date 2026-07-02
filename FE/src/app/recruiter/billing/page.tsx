'use client'

import React from 'react'
import { CurrentPlanCard } from '@/src/components/billing/CurrentPlanCard'
import { PaymentHistoryTable } from '@/src/components/billing/PaymentHistoryTable'
import { useMyCurrentSubscriptionQuery } from '@/src/hooks/subscription'
import { useMyPaymentHistoryQuery } from '@/src/hooks/payment'
import { useAuthStore } from '@/src/stores/auth.store'


export default function RecruiterBillingPage() {
  const { user } = useAuthStore()
  
  const { data: subRes, isLoading: isSubLoading } = useMyCurrentSubscriptionQuery(!!user)
  const { data: paymentRes, isLoading: isPaymentLoading } = useMyPaymentHistoryQuery(0, 50)

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen">


      <CurrentPlanCard subscription={subRes} isLoading={isSubLoading} />

      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Lịch sử giao dịch</h2>
          {/* Option to add export invoice button in future */}
        </div>
        <PaymentHistoryTable payments={paymentRes?.content || []} isLoading={isPaymentLoading} />
      </div>
    </div>
  )
}
