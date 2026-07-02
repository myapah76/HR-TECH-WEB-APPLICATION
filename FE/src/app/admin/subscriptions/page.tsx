'use client'

import { useState } from 'react'
import PageHeader from '@/src/components/ui/PageHeader'
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  Briefcase,
  Users,
  Loader2,
} from 'lucide-react'
import {
  useGetAdminSubscriptionPlans,
  useGetFeatures,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
} from '@/src/hooks/subscriptionPlan'
import { SubscriptionType } from '@/src/types/subscription'
import { toast } from 'sonner'
import Loading from '@/src/app/loading'

export default function AdminSubscriptionsPage() {
  const { data: plans, isLoading: isPlansLoading } = useGetAdminSubscriptionPlans()
  const { data: systemFeatures, isLoading: isFeaturesLoading } = useGetFeatures()

  const createMutation = useCreateSubscriptionPlan()
  const updateMutation = useUpdateSubscriptionPlan()
  const deleteMutation = useDeleteSubscriptionPlan()

  // Tab: 'COMPANY' | 'CANDIDATE'
  const [activeTab, setActiveTab] = useState<SubscriptionType>(SubscriptionType.COMPANY)

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [durationDays, setDurationDays] = useState(30)
  const [subType, setSubType] = useState<SubscriptionType>(SubscriptionType.COMPANY)
  const [isActive, setIsActive] = useState(true)
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, number>>({})

  // Handle open modal for creating
  const handleOpenCreate = () => {
    setName('')
    setDescription('')
    setPrice(0)
    setDurationDays(30)
    setSubType(activeTab)
    setIsActive(true)
    setSelectedFeatures({})
    setEditingPlanId(null)
    setIsModalOpen(true)
  }

  // Handle open modal for editing
  const handleOpenEdit = (plan: any) => {
    setName(plan.name)
    setDescription(plan.description || '')
    setPrice(plan.price)
    setDurationDays(plan.durationDays)
    setSubType(plan.subscriptionType)
    setIsActive(plan.isActive)
    
    // Map existing features
    const feats: Record<string, number> = {}
    plan.features?.forEach((f: any) => {
      // Find the feature by code in systemFeatures to get its ID
      const sysFeat = systemFeatures?.find((sf) => sf.code === f.code)
      if (sysFeat) {
        feats[sysFeat.id] = f.quota
      }
    })
    setSelectedFeatures(feats)
    setEditingPlanId(plan.id)
    setIsModalOpen(true)
  }

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures((prev) => {
      const copy = { ...prev }
      if (copy[featureId] !== undefined) {
        delete copy[featureId]
      } else {
        copy[featureId] = 0 // default quota
      }
      return copy
    })
  }

  const handleFeatureQuotaChange = (featureId: string, quota: number) => {
    setSelectedFeatures((prev) => ({
      ...prev,
      [featureId]: quota,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Vui lòng nhập tên gói dịch vụ')
      return
    }

    const planFeaturesPayload = Object.entries(selectedFeatures).map(([id, quota]) => ({
      id,
      quota,
    }))

    const payload = {
      name,
      description,
      price,
      durationDays,
      subscriptionType: subType,
      isActive,
      features: planFeaturesPayload,
    }

    if (editingPlanId) {
      updateMutation.mutate(
        { id: editingPlanId, data: payload },
        {
          onSuccess: () => {
            toast.success('Cập nhật gói dịch vụ thành công!')
            setIsModalOpen(false)
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Tạo gói dịch vụ mới thành công!')
          setIsModalOpen(false)
        },
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Xóa gói dịch vụ thành công!')
        },
      })
    }
  }

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  if (isPlansLoading || isFeaturesLoading) {
    return <Loading />
  }

  const filteredPlans = plans?.filter((p) => p.subscriptionType === activeTab) || []

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        icon={CreditCard}
        title="Quản lý gói dịch vụ"
        subtitle="Thiết lập các gói quyền lợi và mức giá cho doanh nghiệp và ứng viên"
        actions={
          <button
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-blue-500/10 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm gói mới</span>
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab(SubscriptionType.COMPANY)}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-black transition-all cursor-pointer ${
            activeTab === SubscriptionType.COMPANY
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase className="w-4.5 h-4.5" />
          Nhà tuyển dụng (Company)
        </button>
        <button
          onClick={() => setActiveTab(SubscriptionType.CANDIDATE)}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-black transition-all cursor-pointer ${
            activeTab === SubscriptionType.CANDIDATE
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          Ứng viên (Candidate)
        </button>
      </div>

      {/* Grid of plans */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center text-slate-500 font-medium">
          Không có gói dịch vụ nào cho đối tượng này.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
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

                  <div className="space-y-2.5 pt-2 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Quyền lợi gói:
                    </p>
                    {plan.features?.map((f) => (
                      <div key={f.code} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span>{f.name}</span>
                          {f.quota > 0 && (
                            <span className="text-blue-600 ml-1">({f.quota} lượt)</span>
                          )}
                          {f.quota === 0 && (
                            <span className="text-slate-400 ml-1">(Không giới hạn)</span>
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
                  onClick={() => handleOpenEdit(plan)}
                  className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl py-2 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-98"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl p-2 text-slate-500 hover:text-rose-600 cursor-pointer transition-all shadow-xs active:scale-98"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation/Edit Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-base font-black text-slate-950">
                  {editingPlanId ? 'Cập nhật gói dịch vụ' : 'Thêm gói dịch vụ mới'}
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Thiết lập các giới hạn và giá phí cho nhóm đối tượng sử dụng.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Tên gói</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Gói Pro, Premium, v.v."
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
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
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Giá tiền (VND)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
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
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                    min={1}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Đối tượng áp dụng</label>
                  <select
                    value={subType}
                    onChange={(e) => setSubType(e.target.value as SubscriptionType)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold bg-white cursor-pointer focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value={SubscriptionType.COMPANY}>Nhà tuyển dụng (Company)</option>
                    <option value={SubscriptionType.CANDIDATE}>Ứng viên (Candidate)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6 pl-2">
                  <input
                    type="checkbox"
                    id="modal-is-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded-sm focus:ring-blue-500"
                  />
                  <label htmlFor="modal-is-active" className="text-xs font-black text-slate-700 cursor-pointer">
                    Kích hoạt hoạt động
                  </label>
                </div>
              </div>

              {/* Dynamic Feature Checklist Section */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Cấu hình tính năng và giới hạn (Quota)
                </p>

                {systemFeatures && systemFeatures.length > 0 ? (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                    {systemFeatures.map((feat) => {
                      const isSelected = selectedFeatures[feat.id] !== undefined
                      const quotaValue = selectedFeatures[feat.id] ?? 0

                      return (
                        <div
                          key={feat.id}
                          className={`p-3 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                            isSelected ? 'bg-slate-50 border-slate-350' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id={`feat-${feat.id}`}
                              checked={isSelected}
                              onChange={() => handleFeatureToggle(feat.id)}
                              className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded-sm mt-0.5 focus:ring-blue-500 cursor-pointer"
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
                                Giới hạn (Quota):
                              </span>
                              <input
                                type="number"
                                value={quotaValue}
                                onChange={(e) => handleFeatureQuotaChange(feat.id, Number(e.target.value))}
                                className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-right focus:outline-none focus:border-blue-500"
                                min={0}
                                placeholder="0 = vô hạn"
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
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition-all active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <span>Lưu lại</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
