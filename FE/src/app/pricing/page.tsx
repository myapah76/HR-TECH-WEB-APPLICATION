'use client'

import { useState, useEffect, Suspense } from 'react'
import { Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'
import { SubscriptionType } from '@/src/enums/subscriptionPlan.enum'
import { toast } from 'sonner'
import {
  useAllActiveSubscriptionPlansQuery,
  useCreatePaymentMutation,
  useMyCurrentSubscriptionQuery,
} from '@/src/hooks/subscription'
import { refreshToken } from '@/src/services/auth.service'
import { getErrorMessage } from '@/src/utils'
import dayjs from 'dayjs'
import { useMyPaymentHistoryQuery, useVerifyPaymentMutation } from '@/src/hooks/payment'
import { PricingHeader } from '@/src/components/pricing/PricingHeader'
import { PricingTabs } from '@/src/components/pricing/PricingTabs'
import { PricingCard, PricingPackage } from '@/src/components/pricing/PricingCard'
import { PricingStats } from '@/src/components/pricing/PricingStats'
import { PricingFaq } from '@/src/components/pricing/PricingFaq'

function PricingContent() {
  const { user, setAuth } = useAuthStore()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'company' | 'candidate'>(
    user?.roleResponse?.name === RoleUser.RECRUITER ? 'company' : 'candidate'
  )
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const { data: res, isLoading } = useAllActiveSubscriptionPlansQuery()
  const paymentMutation = useCreatePaymentMutation()
  const { data: currentSubRes, isLoading: isSubLoading } = useMyCurrentSubscriptionQuery(!!user)
  const currentSubscription = currentSubRes?.data

  const { data: paymentHistoryRes } = useMyPaymentHistoryQuery(0, 10, !!user)
  const payments = paymentHistoryRes?.data?.content || []
  const pendingPayment = payments.find((p) => p.status === 'PENDING')
  const hasPendingPayment = !!pendingPayment
  const pendingOrderCode = pendingPayment?.orderCode

  const verifyMutation = useVerifyPaymentMutation()
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = (orderCode: number) => {
    setIsVerifying(true)
    verifyMutation.mutate(orderCode, {
      onSuccess: (res) => {
        toast.success(res.message || 'Xác thực thanh toán thành công!')
      },
      onSettled: () => {
        setIsVerifying(false)
      },
    })
  }

  const plans = res?.data || []

  useEffect(() => {
    const handlePaymentResult = async () => {
      const status = searchParams.get('status')
      const cancel = searchParams.get('cancel')
      const code = searchParams.get('code')

      if (status === 'PAID' || (code === '00' && cancel === 'false')) {
        toast.success('Thanh toán thành công! Đang kích hoạt gói dịch vụ...')

        // Remove query parameters from URL to avoid repeating the toast on refresh
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)

        try {
          // Refresh session to get updated user role / subscription status
          const res = await refreshToken()
          setAuth({
            user: res.data.userResponse,
            accessToken: res.data.accessToken,
          })
          toast.success('Gói dịch vụ đã được kích hoạt thành công!')
        } catch (err) {
          toast.error(getErrorMessage(err))
        }
      } else if (status === 'CANCELLED' || cancel === 'true') {
        toast.error('Thanh toán đã bị hủy hoặc thất bại.')

        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }

    handlePaymentResult()
  }, [searchParams, setAuth])

  const handleSubscribe = (packageId: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thực hiện đăng ký gói dịch vụ!')
      router.push('/login')
      return
    }
    paymentMutation.mutate(packageId, {
      onSuccess: (res) => {
        if (res.data?.checkoutUrl) {
          toast.success('Đang khởi tạo liên kết thanh toán...')
          window.location.href = res.data.checkoutUrl
        } else {
          toast.error('Không tìm thấy liên kết thanh toán!')
        }
      },
    })
  }

  const hrPackages = plans.filter((p) => p.subscriptionType === SubscriptionType.COMPANY)
  const candidatePackages = plans.filter((p) => p.subscriptionType === SubscriptionType.CANDIDATE)

  const rawPackages = activeTab === 'candidate' ? candidatePackages : hrPackages

  const packages: PricingPackage[] = rawPackages.map((pkg) => {
    const isPopular =
      pkg.name.toLowerCase().includes('premium') ||
      pkg.name.toLowerCase().includes('chuyên nghiệp') ||
      pkg.name.toLowerCase().includes('cao cấp') ||
      pkg.name.toLowerCase().includes('pro')
    const isCurrent = currentSubscription?.planId === pkg.id

    // Check current active subscription type
    const currentSubPlan = plans.find((p) => p.id === currentSubscription?.planId)
    const isUserPremium = currentSubscription && currentSubPlan && currentSubPlan.price > 0

    let remainingDays = 0
    let formattedEndDate = ''
    if (isCurrent && currentSubscription?.endDate) {
      remainingDays = dayjs(currentSubscription.endDate).diff(dayjs(), 'day')
      formattedEndDate = dayjs(currentSubscription.endDate).format('DD/MM/YYYY')
    }

    const isFree = pkg.price === 0
    let buttonText = ''
    let isButtonDisabled = false
    let showRenewButton = false
    let subInfoText = ''

    if (isFree) {
      if (isCurrent) {
        buttonText = 'Đang sử dụng'
        isButtonDisabled = true
      } else {
        // Upgrade button enabled if user is not on Premium
        if (isUserPremium) {
          buttonText = 'Đăng ký'
          isButtonDisabled = true // Disable free package switch while premium is active
        } else {
          buttonText = 'Sử dụng miễn phí'
          isButtonDisabled = false
        }
      }
    } else {
      // Premium Plan
      if (isCurrent) {
        subInfoText = `Hết hạn ngày ${formattedEndDate}`
        if (remainingDays > 30) {
          buttonText = 'Đang sử dụng'
          isButtonDisabled = true
        } else {
          // remainingDays <= 30
          buttonText = 'Gia hạn ngay'
          isButtonDisabled = false
          showRenewButton = true
        }
      } else {
        buttonText = 'Nâng cấp ngay'
        isButtonDisabled = false
      }
    }

    let period = ''
    if (pkg.durationDays > 0) {
      if (pkg.durationDays === 30) period = '/tháng'
      else if (pkg.durationDays === 365) period = '/năm'
      else period = `/${pkg.durationDays} ngày`
    }

    return {
      id: pkg.id,
      name: pkg.name,
      rawPrice: pkg.price,
      price:
        pkg.price === 0
          ? 'Miễn phí'
          : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
              pkg.price
            ),
      period,
      description: pkg.description,
      features: pkg.features || [],
      isPopular,
      isCurrent,
      buttonText,
      isButtonDisabled,
      showRenewButton,
      subInfoText,
    }
  })

  const showTabs = !user || user.roleResponse?.name === RoleUser.ADMIN_SYSTEM

  // Dynamic layout to center card(s) if there are less than 3, but maintain a premium grid layout up to 3 columns
  const gridClass =
    packages.length === 1
      ? 'max-w-md mx-auto grid grid-cols-1 gap-8 relative z-10'
      : packages.length === 2
        ? 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 justify-center relative z-10'
        : 'max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch relative z-10'

  const faqs = [
    {
      q: 'Tôi có thể thay đổi hoặc hủy gói dịch vụ đã mua không?',
      a: 'Hoàn toàn được. Bạn có thể thay đổi gói dịch vụ hoặc hủy gia hạn bất kỳ lúc nào trong phần cài đặt tài khoản của mình. Mọi quyền lợi của gói cũ sẽ được bảo lưu cho đến hết chu kỳ thanh toán.',
    },
    {
      q: 'Hệ thống hỗ trợ những phương thức thanh toán nào?',
      a: 'Chúng tôi hỗ trợ chuyển khoản ngân hàng qua mã QR (PayOS), thẻ ATM nội địa, thẻ quốc tế Visa/Mastercard. Quá trình thanh toán diễn ra hoàn toàn tự động và bảo mật.',
    },
    {
      q: 'Tôi có thể yêu cầu xuất hóa đơn đỏ (VAT) không?',
      a: 'Có, dành cho các doanh nghiệp đăng ký gói HR. Vui lòng liên hệ với bộ phận hỗ trợ khách hàng trong vòng 7 ngày kể từ khi thanh toán thành công để cung cấp thông tin xuất hóa đơn.',
    },
    {
      q: 'Tính năng tự động quét và gợi ý CV hoạt động như thế nào?',
      a: 'Hệ thống sử dụng AI để phân tích sự tương thích giữa yêu cầu công việc của nhà tuyển dụng và CV của ứng viên, từ đó tự động đưa ra điểm số đánh giá và gợi ý ghép cặp phù hợp nhất.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden pb-24 font-sans">
      {/* Premium background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-150 bg-linear-to-b from-indigo-50/50 via-slate-50/20 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8">
        <PricingHeader />

        <PricingTabs activeTab={activeTab} onChange={setActiveTab} showTabs={showTabs} />

        {hasPendingPayment && (
          <div className="max-w-4xl mx-auto mb-12 bg-amber-50 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-amber-900 relative z-10 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              </div>
              <div>
                <p className="font-extrabold text-sm">Bạn đang có giao dịch đang chờ xử lý</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Nếu đã chuyển khoản thành công trên PayOS nhưng gói dịch vụ chưa kích hoạt, vui
                  lòng bấm nút bên cạnh để cập nhật tức thì.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleVerify(pendingOrderCode!)}
              disabled={isVerifying}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-3 rounded-xl cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              {isVerifying ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
              ) : null}
              Xác nhận thanh toán
            </button>
          </div>
        )}

        {/* Pricing Cards */}
        {isLoading || isSubLoading || paymentMutation.isPending ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
            </div>
            <p className="text-sm font-semibold text-slate-500">Đang tải...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200/60 rounded-3xl max-w-2xl mx-auto shadow-sm p-10 relative z-10">
            <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có gói dịch vụ nào</h3>
            <p className="text-slate-500 font-medium">
              Hiện tại hệ thống chưa cập nhật các gói dịch vụ. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className={gridClass}>
            {packages.map((pkg, idx) => (
              <PricingCard
                key={pkg.id}
                pkg={pkg}
                idx={idx}
                isPending={paymentMutation.isPending}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        )}

        <PricingStats />

        <PricingFaq faqs={faqs} openFaq={openFaq} onToggleFaq={setOpenFaq} />
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
          </div>
          <p className="text-sm font-semibold text-slate-500">Đang tải bảng giá dịch vụ...</p>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  )
}
