import React from 'react'
import { Star, ArrowRight, Check } from 'lucide-react'
import { motion } from 'motion/react'

export interface PricingFeature {
  code: string
  name: string
  quota: number
  description?: string
}

export interface PricingPackage {
  id: string
  name: string
  rawPrice: number
  price: string
  period: string
  description: string
  features: PricingFeature[]
  isPopular: boolean
  isCurrent: boolean
  buttonText: string
  isButtonDisabled: boolean
  showRenewButton: boolean
  subInfoText?: string
}

interface PricingCardProps {
  pkg: PricingPackage
  idx: number
  isPending: boolean
  onSubscribe: (packageId: string) => void
}

export const PricingCard: React.FC<PricingCardProps> = ({ pkg, idx, isPending, onSubscribe }) => {
  return (
    <motion.div
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

          {/* Button & Sub Info */}
          <div className="space-y-3 mb-8">
            {!(pkg.rawPrice === 0 && !pkg.isCurrent) ? (
              <button
                onClick={() => onSubscribe(pkg.id)}
                disabled={isPending || pkg.isButtonDisabled}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  pkg.isButtonDisabled
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : pkg.isPopular
                      ? 'bg-white text-slate-900 hover:bg-slate-100 hover:scale-[1.01] shadow-md shadow-white/5 active:scale-98'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.01] shadow-lg shadow-indigo-600/10 active:scale-98'
                } ${!pkg.isButtonDisabled && 'cursor-pointer'} disabled:opacity-50`}
              >
                <span>{pkg.buttonText}</span>
                {!pkg.isButtonDisabled && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </button>
            ) : (
              <div className="h-14" />
            )}

            {pkg.subInfoText && (
              <p className={`text-xs text-center font-medium ${pkg.isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                {pkg.subInfoText}
              </p>
            )}
          </div>

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
                        : 'bg-indigo-50 text-indigo-650 flex items-center justify-center text-center'
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
                      {feature.quota > 0 && ['JOB_POSTING', 'AI_CREDIT'].includes(feature.code) && (
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
  )
}
