import React from 'react'
import { Clock, Check, Edit, Power } from 'lucide-react'
import { SubscriptionPlanResponse, SubscriptionType } from '@/src/types/subscription'

interface PlanCardProps {
  plan: SubscriptionPlanResponse
  onEdit: (plan: SubscriptionPlanResponse) => void
  onToggleActive: (plan: SubscriptionPlanResponse) => void
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, onToggleActive }) => {
  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div
      className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
        plan.isActive ? 'border-slate-200/60' : 'border-slate-200/60 opacity-65'
      }`}
    >
      <div>
        {/* Header card */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h3 className="text-base font-black text-slate-900">{plan.name}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Thời hạn: {plan.durationDays} ngày
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
              plan.isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {plan.isActive ? 'Hoạt động' : 'Tạm ngưng'}
          </span>
        </div>

        {/* Pricing & Features */}
        <div className="p-6 space-y-4">
          <div>
            <span className="text-2xl font-black text-slate-900">{formatVnd(plan.price)}</span>
            <span className="text-xs text-slate-400 font-bold">/chu kỳ</span>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {plan.description || 'Không có mô tả.'}
          </p>

          {/* Balances Section */}
          <div className="flex gap-4 text-[10px] font-black text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100/80 mb-3">
            <div className="flex flex-col">
              <span className="text-slate-400 uppercase tracking-wider text-[8px]">AI Credit</span>
              <span className="text-slate-800 text-xs font-black mt-0.5">{plan.aiCreditBalance || 0}</span>
            </div>
            {plan.subscriptionType === SubscriptionType.COMPANY && (
              <div className="flex flex-col border-l border-slate-200 pl-4">
                <span className="text-slate-400 uppercase tracking-wider text-[8px]">Job Post</span>
                <span className="text-slate-800 text-xs font-black mt-0.5">{plan.jobPostBalance || 0}</span>
              </div>
            )}
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-55 animate-fade-in">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Quyền lợi gói:
            </p>
            {plan.features?.filter((f) => !['AI_CREDIT', 'JOB_POSTING'].includes(f.code)).map((f) => (
              <div key={f.code} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span>{f.name}</span>
                  {f.aiCreditCost > 0 && (
                    <span className="text-rose-600 ml-1">({f.aiCreditCost} credits/lượt)</span>
                  )}
                  {f.aiCreditCost === 0 && (
                    <span className="text-slate-400 ml-1">(Miễn phí AI)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
        <button
          onClick={() => onEdit(plan)}
          className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl py-2 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-98"
        >
          <Edit className="w-3.5 h-3.5" />
          Chỉnh sửa
        </button>
        {plan.price > 0 && (
          <button
            onClick={() => onToggleActive(plan)}
            title={plan.isActive ? 'Ngưng hoạt động' : 'Kích hoạt'}
            className={`border rounded-xl p-2 cursor-pointer transition-all shadow-xs active:scale-98 ${
              plan.isActive
                ? 'bg-white hover:bg-amber-50 border-slate-200 hover:border-amber-200 text-slate-500 hover:text-amber-600'
                : 'bg-white hover:bg-emerald-50 border-slate-200 hover:border-emerald-200 text-slate-500 hover:text-emerald-600'
            }`}
          >
            <Power className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
