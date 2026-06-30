import React from 'react'
import { Check, X, ShieldCheck, CreditCard, Sparkles } from 'lucide-react'
import { PricingPackage } from './PricingCard'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  pkg?: PricingPackage
  pkgName?: string
  price?: number
  description?: string
  features?: { name: string; quota: number }[]
  period?: string
  checkoutUrl: string
  isCreatingLink: boolean
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  pkg,
  pkgName,
  price,
  description,
  features,
  period,
  checkoutUrl,
  isCreatingLink,
}) => {
  if (!isOpen) return null

  const name = pkg ? pkg.name : (pkgName || '')
  const displayPrice = pkg ? pkg.rawPrice : (price || 0)
  const displayDesc = pkg ? pkg.description : (description || '')
  const displayPeriod = pkg ? pkg.period : (period || '')
  const displayFeatures = pkg ? pkg.features : (features || [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200/85 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-y-visible">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL: PACKAGE DETAILS */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-slate-50 dark:bg-slate-950/40 border-r border-slate-150 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Đơn hàng dịch vụ
            </span>
            
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Xác nhận nâng cấp
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              Vui lòng kiểm tra lại quyền lợi và thông tin thanh toán cho gói dịch vụ của bạn.
            </p>

            {/* Package details card */}
            <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-lg font-black text-slate-900 dark:text-white">{name}</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white shrink-0">
                  {new Intl.NumberFormat('vi-VN').format(displayPrice)} ₫
                  {displayPeriod && <span className="text-xs font-semibold text-slate-400 ml-1">{displayPeriod}</span>}
                </span>
              </div>
              {displayDesc && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{displayDesc}</p>}
            </div>

            {/* Features list */}
            {displayFeatures.length > 0 && (
              <div className="mt-8">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                  Quyền lợi của gói dịch vụ:
                </h4>
                <ul className="space-y-3">
                  {displayFeatures.slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mt-0.5">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {feature.name} {feature.quota > 0 && `(${feature.quota})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Secure badge */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-3 text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium">
              Thanh toán an toàn, bảo mật tuyệt đối qua cổng thanh toán PayOS.
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: PAYOS EMBEDDED CHECKOUT */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-center bg-white dark:bg-slate-900 min-h-[480px]">
          {isCreatingLink ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <span className="w-10 h-10 rounded-full border-4 border-indigo-600/30 border-t-indigo-650 animate-spin"></span>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 animate-pulse">
                Đang khởi tạo mã QR thanh toán PayOS...
              </p>
            </div>
          ) : checkoutUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {/* Embedded PayOS Hosted Page */}
              <iframe
                src={checkoutUrl}
                title="Cổng thanh toán PayOS"
                className="w-full h-[450px] border-0 rounded-[1.5rem] shadow-xs"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 text-center leading-normal">
                Mở ứng dụng Ngân hàng quét mã QR trên để chuyển khoản tự động.<br />
                Gói dịch vụ sẽ được kích hoạt ngay sau khi chuyển khoản thành công.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Không thể tải thông tin thanh toán. Vui lòng thử lại.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
