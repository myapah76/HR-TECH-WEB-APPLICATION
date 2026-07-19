import React, { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { SubscriptionType } from '@/src/types/subscription'

interface PlanModalProps {
  isOpen: boolean
  editingPlan: any | null
  systemFeatures: any[]
  isPending: boolean
  onClose: () => void
  onSubmit: (payload: any) => void
}

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  editingPlan,
  systemFeatures,
  isPending,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [durationDays, setDurationDays] = useState(30)
  const [subType, setSubType] = useState<SubscriptionType>(SubscriptionType.COMPANY)
  const [isActive, setIsActive] = useState(true)
  const [aiCreditBalance, setAiCreditBalance] = useState(0)
  const [jobPostBalance, setJobPostBalance] = useState(0)
  const [dailyAiLimit, setDailyAiLimit] = useState(0)
  const [weeklyAiLimit, setWeeklyAiLimit] = useState(0)
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, number>>({})

  useEffect(() => {
    if (editingPlan) {
      setName(editingPlan.name)
      setDescription(editingPlan.description || '')
      setPrice(editingPlan.price)
      setDurationDays(editingPlan.durationDays)
      setSubType(editingPlan.subscriptionType)
      setIsActive(editingPlan.isActive)
      setAiCreditBalance(editingPlan.aiCreditBalance || 0)
      setJobPostBalance(editingPlan.jobPostBalance || 0)
      setDailyAiLimit(editingPlan.dailyAiLimit || 0)
      setWeeklyAiLimit(editingPlan.weeklyAiLimit || 0)

      const feats: Record<string, number> = {}
      editingPlan.features?.forEach((f: any) => {
        const sysFeat = systemFeatures?.find((sf) => sf.code === f.code)
        if (sysFeat) {
          feats[sysFeat.id] = f.aiCreditCost || 0
        }
      })
      setSelectedFeatures(feats)
    } else {
      setName('')
      setDescription('')
      setPrice(0)
      setDurationDays(30)
      setSubType(SubscriptionType.COMPANY)
      setIsActive(true)
      setAiCreditBalance(0)
      setJobPostBalance(0)
      setDailyAiLimit(0)
      setWeeklyAiLimit(0)
      setSelectedFeatures({})
    }
  }, [editingPlan, isOpen, systemFeatures])

  if (!isOpen) return null

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures((prev) => {
      const copy = { ...prev }
      if (copy[featureId] !== undefined) {
        delete copy[featureId]
      } else {
        copy[featureId] = 0
      }
      return copy
    })
  }

  const handleFeatureQuotaChange = (featureId: string, cost: number) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [featureId]: cost,
    }))
  }

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    const featuresPayload = Object.entries(selectedFeatures).map(([id, aiCreditCost]) => ({
      id,
      aiCreditCost,
    }))

    const payload = {
      name,
      description,
      price,
      durationDays,
      subscriptionType: subType,
      isActive: price === 0 ? true : isActive,
      aiCreditBalance,
      dailyAiLimit,
      weeklyAiLimit,
      ...(subType === SubscriptionType.COMPANY ? { jobPostBalance } : {}),
      features: featuresPayload,
    }

    onSubmit(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-base font-black text-slate-955">
              {editingPlan ? 'Cập nhật gói dịch vụ' : 'Thêm gói dịch vụ mới'}
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Thiết lập các giới hạn và giá phí cho nhóm đối tượng sử dụng.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Tên gói</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Gói Pro, Premium, v.v."
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-500 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Mô tả chi tiết</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn gọn về quyền lợi đi kèm..."
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-500 transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Giá tiền (VND)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-500 transition-all"
                min={0}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Thời hạn (ngày)</label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                placeholder="30"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-500 transition-all"
                min={1}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Đối tượng áp dụng</label>
              <select
                value={subType}
                onChange={(e) => setSubType(e.target.value as SubscriptionType)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-violet-500 transition-all"
              >
                <option value={SubscriptionType.COMPANY}>Nhà tuyển dụng (Company)</option>
                <option value={SubscriptionType.CANDIDATE}>Ứng viên (Candidate)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">AI Credit cấp</label>
              <input
                type="number"
                value={aiCreditBalance}
                onChange={(e) => setAiCreditBalance(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-500 transition-all"
                min={0}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Giới hạn AI Credit ngày</label>
              <input
                type="number"
                value={dailyAiLimit}
                onChange={(e) => setDailyAiLimit(Number(e.target.value))}
                placeholder="Nhập 0 để không giới hạn"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-500 transition-all"
                min={0}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Giới hạn AI Credit tuần</label>
              <input
                type="number"
                value={weeklyAiLimit}
                onChange={(e) => setWeeklyAiLimit(Number(e.target.value))}
                placeholder="Nhập 0 để không giới hạn"
                className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-500 transition-all"
                min={0}
                required
              />
            </div>

            {subType === SubscriptionType.COMPANY && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Job Post cấp</label>
                <input
                  type="number"
                  value={jobPostBalance}
                  onChange={(e) => setJobPostBalance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-500 transition-all"
                  min={0}
                  required
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-6 pl-2">
              <input
                type="checkbox"
                id="modal-is-active"
                checked={isActive}
                disabled={price === 0}
                onChange={(e) => setIsActive(price === 0 ? true : e.target.checked)}
                className="w-4.5 h-4.5 text-violet-600 border-slate-300 rounded-sm focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="modal-is-active" className="text-xs font-black text-slate-700 cursor-pointer disabled:opacity-50">
                Kích hoạt hoạt động {price === 0 && <span className="text-[10px] text-slate-400 font-bold ml-1">(Bắt buộc đối với gói Miễn phí)</span>}
              </label>
            </div>
          </div>

          {/* Dynamic Feature Checklist Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Cấu hình tính năng & Chi phí AI Credit mỗi lượt
            </p>

            {systemFeatures && systemFeatures.length > 0 ? (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                {systemFeatures
                  .filter((feat) => !['AI_CREDIT', 'JOB_POSTING'].includes(feat.code))
                  .map((feat) => {
                    const isSelected = selectedFeatures[feat.id] !== undefined
                    const quotaValue = selectedFeatures[feat.id] ?? 0

                    return (
                      <div
                        key={feat.id}
                        className={`rounded-2xl border transition-all p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isSelected ? 'bg-slate-50 border-violet-200' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={`feat-${feat.id}`}
                            checked={isSelected}
                            onChange={() => handleFeatureToggle(feat.id)}
                            className="w-4.5 h-4.5 text-violet-600 border-slate-300 rounded-sm mt-0.5 focus:ring-violet-500 cursor-pointer"
                          />
                          <div>
                            <label
                              htmlFor={`feat-${feat.id}`}
                              className="text-xs font-black text-slate-800 cursor-pointer"
                            >
                              {feat.name}
                            </label>
                            <p className="text-[10px] text-slate-400 font-semibold">{feat.description}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-450 uppercase whitespace-nowrap">
                              Chi phí AI Credit:
                            </span>
                            <input
                              type="number"
                              value={quotaValue}
                              onChange={(e) => handleFeatureQuotaChange(feat.id, Number(e.target.value))}
                              className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right focus:outline-none focus:border-violet-500"
                              min={0}
                              placeholder="0"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Không tìm thấy tính năng hệ thống nào.</p>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition-all active:scale-95"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              {isPending ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <span>Lưu lại</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
