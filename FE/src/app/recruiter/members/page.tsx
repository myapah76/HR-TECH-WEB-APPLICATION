'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import PageHeader from '@/src/components/ui/PageHeader'
import Badge from '@/src/components/ui/Badge'
import {
  UserCheck,
  Trash2,
  UserPlus,
  X,
  Loader2,
  ShieldAlert,
} from 'lucide-react'
import { useAuthStore } from '@/src/stores/auth.store'
import {
  useGetMyCompany,
  useGetCompanyMembers,
  useAddCompanyMember,
  useRemoveCompanyMember,
} from '@/src/hooks/company'

const ROLE_BADGES: Record<
  string,
  { label: string; variant: 'success' | 'info' | 'default' }
> = {
  OWNER: { label: 'Chủ sở hữu', variant: 'success' },
  HR_MANAGER: { label: 'Quản lý HR', variant: 'info' },
  HR: { label: 'Tuyển dụng (HR)', variant: 'default' },
}

export default function RecruiterMembersPage() {
  const { user } = useAuthStore()
  const { data: myCompany, isLoading: isCompanyLoading } = useGetMyCompany()
  const companyId = myCompany?.id

  // Fetch company members list
  const { data: companyMembers = [], isLoading: isMembersLoading } = useGetCompanyMembers(
    companyId,
    !!companyId
  )
  const currentMember = companyMembers.find((m) => m.userId === user?.id)
  const isOwner = currentMember?.role === 'OWNER'

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newFullName, setNewFullName] = useState('')
  const [newRole, setNewRole] = useState('HR')

  const addMemberMutation = useAddCompanyMember()
  const removeMemberMutation = useRemoveCompanyMember()

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail || !newFullName || !newRole) {
      toast.error('Vui lòng nhập đầy đủ thông tin.')
      return
    }
    try {
      await addMemberMutation.mutateAsync({
        companyId: companyId!,
        request: { email: newEmail, fullName: newFullName, role: newRole },
      })
      toast.success(
        'Thêm nhân sự thành công! Mật khẩu tạm thời đã được gửi tới email của họ.'
      )
      setIsAddModalOpen(false)
      setNewEmail('')
      setNewFullName('')
      setNewRole('HR')
    } catch (error: any) {
      console.error(error)
      const errorMsg =
        error?.response?.data?.message || 'Có lỗi xảy ra khi thêm nhân sự.'
      toast.error(errorMsg)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (
      !window.confirm(`Bạn có chắc chắn muốn xoá nhân sự "${memberName}" khỏi công ty?`)
    ) {
      return
    }
    try {
      await removeMemberMutation.mutateAsync({ companyId: companyId!, memberId })
      toast.success('Đã xoá nhân sự thành công.')
    } catch (error: any) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi xoá nhân sự.')
    }
  }

  const isLoading = isCompanyLoading || isMembersLoading

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-xs font-bold">Đang tải thông tin nhân sự...</p>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-6 bg-white rounded-2xl border border-slate-200/60 shadow-xs mt-10">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-base font-black text-slate-900">Quyền truy cập bị từ chối</h2>
        <p className="text-xs font-bold text-slate-500 mt-2 leading-relaxed">
          Chỉ có Chủ sở hữu (Owner) của công ty mới có quyền truy cập trang quản lý nhân sự này.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6 font-sans">
      <PageHeader
        icon={UserCheck}
        title="Quản lý nhân sự"
        subtitle="Quản lý thành viên trong doanh nghiệp, cấp tài khoản cho HR và HR Manager"
      />

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">Thành viên công ty</h2>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              Danh sách tài khoản HR thuộc doanh nghiệp của bạn
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-sm hover:shadow"
          >
            <UserPlus className="h-4 w-4" />
            <span>Thêm nhân sự</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="pb-3">Họ và tên</th>
                <th className="pb-3">Email công việc</th>
                <th className="pb-3">Vai trò</th>
                <th className="pb-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {companyMembers.map((member) => {
                const memberFullName =
                  `${member.lastName || ''} ${member.firstName || ''}`.trim() ||
                  'Thành viên'
                const isSelf = member.userId === user?.id
                const roleBadge = ROLE_BADGES[member.role] || {
                  label: member.role,
                  variant: 'default',
                }
                return (
                  <tr key={member.id} className="hover:bg-slate-50/50">
                    <td className="py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
                          {memberFullName.charAt(0)}
                        </div>
                        <span className="text-xs font-extrabold text-slate-800">
                          {memberFullName}{' '}
                          {isSelf && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              (Bạn)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-500">
                      {member.email}
                    </td>
                    <td className="py-4">
                      <Badge variant={roleBadge.variant} size="sm">
                        {roleBadge.label}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      {!isSelf && member.role !== 'OWNER' && (
                        <button
                          onClick={() => handleRemoveMember(member.id, memberFullName)}
                          disabled={removeMemberMutation.isPending}
                          className="p-1.5 text-rose-450 hover:text-rose-650 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                          title="Xoá nhân sự"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-black text-slate-900">Thêm nhân sự mới</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Họ và tên</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Email công việc</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Vai trò tuyển dụng</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="HR">Tuyển dụng (HR)</option>
                  <option value="HR_MANAGER">Quản lý HR (HR Manager)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={addMemberMutation.isPending}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {addMemberMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Đang tạo tài khoản...</span>
                    </>
                  ) : (
                    <span>Thêm nhân sự</span>
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
