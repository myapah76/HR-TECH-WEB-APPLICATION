import React from 'react'
import { ShieldCheck, Zap, Headphones } from 'lucide-react'

export const PricingStats: React.FC = () => {
  return (
    <div className="mt-20 text-center text-slate-500 text-sm font-medium relative z-10">
      <div className="inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-4 px-6 py-4 rounded-2xl bg-white border border-slate-200/50 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>Giao dịch an toàn & bảo mật</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden md:block" />
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Kích hoạt tự động tức thì</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden md:block" />
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-indigo-500" />
          <span>Hỗ trợ kỹ thuật 24/7</span>
        </div>
      </div>
    </div>
  )
}
