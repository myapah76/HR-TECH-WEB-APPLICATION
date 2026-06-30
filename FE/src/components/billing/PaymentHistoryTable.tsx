'use client'

import React from 'react'
import { PaymentResponse } from '@/src/types/payment'
import { formatDateTime } from '@/src/utils'
import { useVerifyPaymentMutation } from '@/src/hooks/payment'
import Loading from '@/src/app/loading'
import { CheckoutModal } from '@/src/components/pricing/CheckoutModal'

import { toast } from 'sonner'

interface PaymentHistoryTableProps {
  payments: PaymentResponse[]
  isLoading: boolean
  refetchHistory?: () => void
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  payments,
  isLoading,
  refetchHistory,
}) => {
  const { mutate, isPending } = useVerifyPaymentMutation()
  const [activeOrderCode, setActiveOrderCode] = React.useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentResponse | null>(null)

  // Polling payment history when the checkout modal is open
  React.useEffect(() => {
    if (!isModalOpen || !refetchHistory) return

    const interval = setInterval(() => {
      refetchHistory()
    }, 3000)

    return () => clearInterval(interval)
  }, [isModalOpen, refetchHistory])

  // Automatically close modal when payment status updates to PAID
  React.useEffect(() => {
    if (!isModalOpen || !selectedPayment) return

    const currentPayment = payments.find((p) => p.orderCode === selectedPayment.orderCode)
    if (currentPayment && currentPayment.status === 'PAID') {
      setIsModalOpen(false)
      setSelectedPayment(null)
      toast.success('Thanh toán thành công! Gói dịch vụ đã được kích hoạt.')
    }
  }, [payments, selectedPayment, isModalOpen])

  const handleVerify = (orderCode: number) => {
    setActiveOrderCode(orderCode)
    mutate(orderCode, {
      onSuccess: (res) => {
        const payment = res.data
        if (payment && payment.status === 'PENDING' && payment.checkoutUrl) {
          toast.info('Đang mở cổng thanh toán PayOS...')
          setSelectedPayment(payment)
          setIsModalOpen(true)
        } else {
          toast.success(res.message || 'Thanh toán được xác thực thành công!')
        }
      },
      onSettled: () => {
        setActiveOrderCode(null)
      },
    })
  }

  if (isLoading) {
    return <Loading />
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa có giao dịch nào</h3>
        <p className="text-slate-500 text-sm max-w-md">
          Bạn chưa thực hiện bất kỳ giao dịch thanh toán nào trên hệ thống.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Mã giao dịch</th>
              <th className="px-6 py-4">Gói dịch vụ</th>
              <th className="px-6 py-4">Số tiền</th>
              <th className="px-6 py-4">Ngày thanh toán</th>
              <th className="px-6 py-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <tr key={payment.orderCode} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-700 font-medium">#{payment.orderCode}</td>
                <td className="px-6 py-4 text-slate-600">{payment.subscriptionName}</td>
                <td className="px-6 py-4 text-slate-800 font-semibold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                    payment.amount
                  )}
                </td>
                <td className="px-6 py-4 text-slate-500">{formatDateTime(payment.createdAt)}</td>
                <td className="px-6 py-4">
                  {payment.status === 'PAID' && (
                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Thành công
                    </span>
                  )}
                  {payment.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Đang chờ
                      </span>
                      <button
                        onClick={() => handleVerify(payment.orderCode)}
                        disabled={isPending}
                        className="inline-flex items-center justify-center gap-2 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-indigo-500/10"
                        title="Kiểm tra trạng thái thực tế từ PayOS"
                      >
                        {isPending && activeOrderCode === payment.orderCode ? (
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                        ) : (
                          'Kiểm tra'
                        )}
                      </button>
                    </div>
                  )}
                  {payment.status === 'CANCELLED' && (
                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      Đã hủy
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPayment && (
        <CheckoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pkgName={selectedPayment.subscriptionName}
          price={selectedPayment.amount}
          checkoutUrl={selectedPayment.checkoutUrl || ''}
          isCreatingLink={false}
        />
      )}
    </div>
  )
}
