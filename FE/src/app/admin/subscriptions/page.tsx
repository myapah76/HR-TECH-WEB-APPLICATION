'use client'

import { useState } from 'react'
import { Plus, Briefcase, Users } from 'lucide-react'
import {
  useGetAdminSubscriptionPlans,
  useGetFeatures,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
} from '@/src/hooks/subscriptionPlan'
import { SubscriptionType } from '@/src/types/subscription'
import { toast } from 'sonner'
import Loading from '@/src/app/loading'
import { PlanCard } from '@/src/components/admin/subscriptions/PlanCard'
import { PlanModal } from '@/src/components/admin/subscriptions/PlanModal'
import { ConfirmModal } from '@/src/components/admin/subscriptions/ConfirmModal'

export default function AdminSubscriptionsPage() {
  const { data: plans, isLoading: isPlansLoading } = useGetAdminSubscriptionPlans()
  const { data: systemFeatures, isLoading: isFeaturesLoading } = useGetFeatures()

  const createMutation = useCreateSubscriptionPlan()
  const updateMutation = useUpdateSubscriptionPlan()

  // Tab: 'COMPANY' | 'CANDIDATE'
  const [activeTab, setActiveTab] = useState<SubscriptionType>(SubscriptionType.COMPANY)

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any | null>(null)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  // Handle open modal for creating
  const handleOpenCreate = () => {
    setEditingPlan(null)
    setIsModalOpen(true)
  }

  // Handle open modal for editing
  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan)
    setIsModalOpen(true)
  }

  const handleToggleActive = (plan: any) => {
    if (plan.price === 0) {
      toast.error('Không thể ngưng hoạt động gói cước Miễn phí!')
      return
    }
    const nextStatus = !plan.isActive
    const actionText = nextStatus ? 'kích hoạt lại' : 'ngưng hoạt động'

    setConfirmModal({
      isOpen: true,
      title: `${nextStatus ? 'Kích hoạt' : 'Ngưng hoạt động'} gói dịch vụ`,
      message: `Bạn có chắc chắn muốn ${actionText} gói dịch vụ "${plan.name}"?`,
      onConfirm: () => {
        const planFeaturesPayload = plan.features?.map((f: any) => {
          const sysFeat = systemFeatures?.find((sf) => sf.code === f.code)
          return {
            id: sysFeat?.id || '',
            aiCreditCost: f.aiCreditCost || 0,
          }
        }).filter((f: any) => f.id) || []

        const payload = {
          name: plan.name,
          description: plan.description || '',
          price: plan.price,
          durationDays: plan.durationDays,
          subscriptionType: plan.subscriptionType,
          isActive: nextStatus,
          aiCreditBalance: plan.aiCreditBalance || 0,
          dailyAiLimit: plan.dailyAiLimit || 0,
          weeklyAiLimit: plan.weeklyAiLimit || 0,
          ...(plan.subscriptionType === SubscriptionType.COMPANY ? { jobPostBalance: plan.jobPostBalance || 0 } : {}),
          features: planFeaturesPayload,
        }

        updateMutation.mutate(
          { id: plan.id, data: payload },
          {
            onSuccess: () => {
              toast.success(`${nextStatus ? 'Kích hoạt' : 'Ngưng hoạt động'} gói dịch vụ thành công!`)
              setConfirmModal((prev) => ({ ...prev, isOpen: false }))
            },
            onError: () => {
              setConfirmModal((prev) => ({ ...prev, isOpen: false }))
            }
          }
        )
      }
    })
  }

  const handleModalSubmit = (payload: any) => {
    if (editingPlan) {
      updateMutation.mutate(
        { id: editingPlan.id, data: payload },
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

  if (isPlansLoading || isFeaturesLoading) {
    return <Loading />
  }

  const filteredPlans = plans?.filter((p) => p.subscriptionType === activeTab) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-6">
        <button
          onClick={handleOpenCreate}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-violet-500/10 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm gói mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab(SubscriptionType.COMPANY)}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-black transition-all cursor-pointer ${
            activeTab === SubscriptionType.COMPANY
              ? 'border-violet-600 text-violet-600'
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
              ? 'border-violet-600 text-violet-600'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleOpenEdit}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Creation/Edit Dialog Modal */}
      <PlanModal
        isOpen={isModalOpen}
        editingPlan={editingPlan}
        systemFeatures={systemFeatures || []}
        isPending={createMutation.isPending || updateMutation.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isPending={updateMutation.isPending}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  )
}
