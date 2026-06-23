'use client'

import { useState, useEffect, Suspense } from 'react'
import {
  Check,
  Star,
  Building2,
  User,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Zap,
  Headphones,
  ArrowRight,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'
import { SubscriptionType } from '@/src/enums/subcriptionPlan.enum'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import {
  useAllActiveSubscriptionPlansQuery,
  useCreatePaymentMutation,
} from '@/src/hooks/subscription'
import { refreshToken } from '@/src/services/auth.service'
import { getErrorMessage } from '@/src/utils/get-error-message'

function PricingContent() {
  const { user, setAuth } = useAuthStore()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<'company' | 'candidate'>(
    user?.roleResponse?.name === RoleUser.RECRUITER ? 'company' : 'candidate'
  )
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const router = useRouter()

  const { data: res, isLoading } = useAllActiveSubscriptionPlansQuery()
  const paymentMutation = useCreatePaymentMutation()

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

  const packages = rawPackages.map((pkg) => {
    const isPopular =
      pkg.name.toLowerCase().includes('premium') ||
      pkg.name.toLowerCase().includes('chuyên nghiệp') ||
      pkg.name.toLowerCase().includes('cao cấp') ||
      pkg.name.toLowerCase().includes('pro')
    const buttonText = pkg.price === 0 ? 'Sử dụng miễn phí' : 'Nâng cấp ngay'

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
      buttonText,
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
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/60 text-indigo-650 font-bold text-xs tracking-wider uppercase mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Nâng tầm cơ hội & Doanh nghiệp</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Gói dịch vụ linh hoạt cho <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-blue-600 to-indigo-600">
              mọi nhu cầu của bạn
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Khám phá các gói dịch vụ được thiết kế tối ưu để tăng tốc tìm kiếm việc làm hoặc nâng
            cao hiệu suất tuyển dụng.
          </p>
        </div>

        {/* Tabs / Toggle */}
        {showTabs && (
          <div className="flex justify-center mb-16">
            <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 inline-flex relative w-full max-w-md">
              <button
                onClick={() => setActiveTab('candidate')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
                  activeTab === 'candidate'
                    ? 'text-slate-900 font-extrabold'
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                <User className="w-4 h-4" />
                Dành cho Ứng Viên
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${
                  activeTab === 'company'
                    ? 'text-slate-900 font-extrabold'
                    : 'text-slate-500 hover:text-slate-950'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Dành cho Doanh Nghiệp
              </button>

              {/* Slider background */}
              <motion.div
                layoutId="activeTabSlider"
                className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-sm border border-slate-200/30"
                style={{
                  left: activeTab === 'candidate' ? '6px' : '50%',
                  width: 'calc(50% - 6px)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        {isLoading || paymentMutation.isPending ? (
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
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative flex flex-col justify-between rounded-[2rem] p-8 md:p-10 transition-all duration-300 group ${
                  pkg.isPopular
                    ? 'bg-slate-900 text-white border border-slate-800 shadow-xl shadow-slate-950/20 hover:shadow-2xl hover:shadow-indigo-500/10 lg:-translate-y-2'
                    : 'bg-white text-slate-950 border border-slate-200/80 shadow-sm hover:border-slate-350 hover:shadow-md'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                      <Star className="w-3 h-3 fill-yellow-300 text-yellow-300 animate-pulse" />
                      Phổ biến nhất
                    </span>
                  </div>
                )}

                <div className="flex flex-col h-full justify-between">
                  <div>
                    {/* Header Details */}
                    <div className="mb-6">
                      <h3
                        className={`text-2xl font-black tracking-tight ${pkg.isPopular ? 'text-white' : 'text-slate-900'}`}
                      >
                        {pkg.name}
                      </h3>
                      <p
                        className={`text-sm mt-3 font-medium leading-relaxed min-h-12 ${
                          pkg.isPopular ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {pkg.description}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="mb-8">
                      {pkg.rawPrice === 0 ? (
                        <div className="flex items-baseline">
                          <span
                            className={`text-4xl font-extrabold tracking-tight ${pkg.isPopular ? 'text-white' : 'text-slate-900'}`}
                          >
                            Miễn phí
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline">
                          <span
                            className={`text-4xl font-black tracking-tight ${pkg.isPopular ? 'text-white' : 'text-slate-900'}`}
                          >
                            {new Intl.NumberFormat('vi-VN').format(pkg.rawPrice)}
                          </span>
                          <span
                            className={`text-lg font-bold ml-1 ${pkg.isPopular ? 'text-indigo-400' : 'text-indigo-650'}`}
                          >
                            ₫
                          </span>
                          {pkg.period && (
                            <span
                              className={`text-sm font-semibold ml-2 ${
                                pkg.isPopular ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {pkg.period}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => handleSubscribe(pkg.id)}
                      disabled={paymentMutation.isPending}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 mb-8 ${
                        pkg.isPopular
                          ? 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.01] shadow-md shadow-white/5 active:scale-98'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.01] shadow-lg shadow-indigo-600/10 active:scale-98'
                      } cursor-pointer disabled:opacity-50`}
                    >
                      <span>{pkg.buttonText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>

                    <div
                      className={`border-t my-6 ${pkg.isPopular ? 'border-slate-800' : 'border-slate-150'}`}
                    />

                    {/* Features list */}
                    <div className="flex-1 flex flex-col">
                      <span
                        className={`text-[10px] font-bold tracking-wider uppercase mb-4 ${
                          pkg.isPopular ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        Quyền lợi gói dịch vụ:
                      </span>
                      <ul className="space-y-4">
                        {pkg.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 group/item">
                            <span
                              className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 transition-colors ${
                                pkg.isPopular
                                  ? 'bg-blue-500/15 text-blue-400 group-hover/item:bg-blue-500/25'
                                  : 'bg-indigo-55 bg-indigo-50 text-indigo-650 flex items-center justify-center text-center'
                              }`}
                            >
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </span>
                            <div className="flex flex-col">
                              <span
                                className={`text-sm font-bold leading-tight ${
                                  pkg.isPopular ? 'text-slate-200' : 'text-slate-700'
                                }`}
                              >
                                {feature.name}
                                {feature.quota > 0 && (
                                  <span
                                    className={`font-black ml-1 ${pkg.isPopular ? 'text-blue-400' : 'text-indigo-600'}`}
                                  >
                                    ({feature.quota})
                                  </span>
                                )}
                                {feature.quota === -1 && (
                                  <span
                                    className={`font-black ml-1 ${pkg.isPopular ? 'text-blue-400' : 'text-indigo-600'}`}
                                  >
                                    (Vô hạn)
                                  </span>
                                )}
                              </span>
                              {feature.description && (
                                <span
                                  className={`text-xs mt-1 leading-snug ${
                                    pkg.isPopular ? 'text-slate-400' : 'text-slate-500'
                                  }`}
                                >
                                  {feature.description}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Trust Stats */}
        <div className="mt-20 text-center text-slate-500 text-sm font-medium relative z-10">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-4 px-6 py-4 rounded-2xl bg-white border border-slate-200/50 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Giao dịch an toàn & bảo mật</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-350 hidden md:block" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Kích hoạt tự động tức thì</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-350 hidden md:block" />
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-indigo-500" />
              <span>Hỗ trợ kỹ thuật 24/7</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-28 max-w-3xl mx-auto border-t border-slate-200/80 pt-20 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Câu hỏi thường gặp
            </h2>
            <p className="text-slate-500 font-medium mt-3">
              Giải đáp nhanh những thắc mắc của bạn về gói dịch vụ
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i
              return (
                <div
                  key={i}
                  className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 text-base cursor-pointer select-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 transition-transform duration-300 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-indigo-650' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
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
