import React from 'react'
import { Sparkles } from 'lucide-react'

export const PricingHeader: React.FC = () => {
  return (
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
  )
}
