'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Badge from '@/src/components/ui/Badge'
import {
  UserCheck,
  UserX,
  UserPlus,
  UserCog,
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
  useReactivateCompanyMember,
  useUpdateMemberRole,
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

  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false)
  const [reactivateTarget, setReactivateTarget] = useState<{ id: string; name: string } | null>(null)

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; name: string } | null>(null)

  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false)
  const [changeRoleTarget, setChangeRoleTarget] = useState<{ id: string; name: string; currentRole: string } | null>(null)
  const [selectedNewRole, setSelectedNewRole] = useState('HR')

  const addMemberMutation = useAddCompanyMember()
  const removeMemberMutation = useRemoveCompanyMember()
  const reactivateMemberMutation = useReactivateCompanyMember()
  const updateRoleMutation = useUpdateMemberRole()

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

  const handleChangeRole = async () => {
    if (!changeRoleTarget || !companyId) return
    if (selectedNewRole === changeRoleTarget.currentRole) {
      setIsChangeRoleModalOpen(false)
      return
    }
    try {
      await updateRoleMutation.mutateAsync({
        companyId,
        memberId: changeRoleTarget.id,
        role: selectedNewRole,
      })
      toast.success(`Đã đổi vai trò của "${changeRoleTarget.name}" thành ${ROLE_BADGES[selectedNewRole]?.label ?? selectedNewRole}.`)
      setIsChangeRoleModalOpen(false)
      setChangeRoleTarget(null)
    } catch (error: any) {
      console.error(error)
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thay đổi vai trò.')
    }
  }

  const handleRevokeMember = async () => {
    if (!revokeTarget || !companyId) return
    try {
      await removeMemberMutation.mutateAsync({ companyId, memberId: revokeTarget.id })
      toast.success(`Đã vô hiệu hóa nhân sự "${revokeTarget.name}" thành công.`)
      setIsRevokeModalOpen(false)
      setRevokeTarget(null)
    } catch (error: any) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi vô hiệu hóa nhân sự.')
    }
  }

  const handleReactivateMember = async (resetPassword: boolean) => {
    if (!reactivateTarget || !companyId) return
    try {
      await reactivateMemberMutation.mutateAsync({
        companyId,
        memberId: reactivateTarget.id,
        resetPassword,
      })
      toast.success(
        resetPassword
          ? `Kích hoạt lại thành công! Mật khẩu mới đã được gửi tới email của ${reactivateTarget.name}.`
          : `Kích hoạt lại thành công cho nhân sự ${reactivateTarget.name}.`
      )
      setIsReactivateModalOpen(false)
      setReactivateTarget(null)
    } catch (error: any) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi kích hoạt lại nhân sự.')
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
    <div className="space-y-6 font-sans">


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
                <th className="pb-3">Trạng thái</th>
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
                const isActive = member.status !== 'INACTIVE'
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
                    <td className="py-4">
                      {isActive ? (
                        <Badge variant="success" size="sm">
                          Hoạt động
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">
                          Vô hiệu hóa
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {!isSelf && member.role !== 'OWNER' && (
                        <div className="inline-flex gap-1.5 justify-end">
                          {isActive ? (
                            <>
                              <button
                                onClick={() => {
                                  setChangeRoleTarget({ id: member.id, name: memberFullName, currentRole: member.role })
                                  setSelectedNewRole(member.role === 'HR' ? 'HR_MANAGER' : 'HR')
                                  setIsChangeRoleModalOpen(true)
                                }}
                                disabled={updateRoleMutation.isPending}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                                title="Thay đổi vai trò"
                              >
                                <UserCog className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setRevokeTarget({ id: member.id, name: memberFullName })
                                  setIsRevokeModalOpen(true)
                                }}
                                disabled={removeMemberMutation.isPending}
                                className="p-1.5 text-rose-450 hover:text-rose-650 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                                title="Vô hiệu hóa nhân sự"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setReactivateTarget({ id: member.id, name: memberFullName })
                                setIsReactivateModalOpen(true)
                              }}
                              disabled={reactivateMemberMutation.isPending}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                              title="Kích hoạt lại nhân sự"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Role Modal */}
      {isChangeRoleModalOpen && changeRoleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-black text-slate-900">Thay đổi vai trò</h3>
              <button
                onClick={() => {
                  setIsChangeRoleModalOpen(false)
                  setChangeRoleTarget(null)
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                Thay đổi vai trò cho nhân sự{' '}
                <strong className="text-slate-800">"{changeRoleTarget.name}"</strong>.
                Vai trò hiện tại:{' '}
                <span className="text-slate-700">{ROLE_BADGES[changeRoleTarget.currentRole]?.label ?? changeRoleTarget.currentRole}</span>
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Vai trò mới</label>
                <select
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="HR">Tuyển dụng (HR)</option>
                  <option value="HR_MANAGER">Quản lý HR (HR Manager)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangeRoleModalOpen(false)
                    setChangeRoleTarget(null)
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleChangeRole}
                  disabled={updateRoleMutation.isPending || selectedNewRole === changeRoleTarget.currentRole}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm hover:shadow"
                >
                  {updateRoleMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <span>Xác nhận thay đổi</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Reactivate Member Modal (Option C) */}
      {isReactivateModalOpen && reactivateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-black text-slate-900">Kích hoạt lại nhân sự</h3>
              <button
                onClick={() => {
                  setIsReactivateModalOpen(false)
                  setReactivateTarget(null)
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                Bạn đang chuẩn bị kích hoạt lại tài khoản cho nhân sự <strong className="text-slate-800">"{reactivateTarget.name}"</strong>.
                Hệ thống hỗ trợ tự động đặt lại mật khẩu mới nếu nhân sự cũ không bàn giao lại mật khẩu.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleReactivateMember(true)}
                  disabled={reactivateMemberMutation.isPending}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm hover:shadow"
                >
                  {reactivateMemberMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  <span>Đặt lại mật khẩu & Gửi Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleReactivateMember(false)}
                  disabled={reactivateMemberMutation.isPending}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold text-xs cursor-pointer transition-colors"
                >
                  Chỉ kích hoạt (Giữ nguyên mật khẩu cũ)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReactivateModalOpen(false)
                    setReactivateTarget(null)
                  }}
                  className="w-full py-2.5 rounded-xl text-slate-450 hover:text-slate-600 font-extrabold text-xs cursor-pointer transition-colors mt-1"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Member Modal Confirmation */}
      {isRevokeModalOpen && revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-black text-slate-900">Vô hiệu hóa nhân sự</h3>
              <button
                onClick={() => {
                  setIsRevokeModalOpen(false)
                  setReactivateTarget(null)
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn vô hiệu hóa nhân sự <strong className="text-slate-850">"{revokeTarget.name}"</strong>? 
                Họ sẽ bị chặn đăng nhập hệ thống ngay lập tức.
              </p>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsRevokeModalOpen(false)
                    setRevokeTarget(null)
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleRevokeMember}
                  disabled={removeMemberMutation.isPending}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm hover:shadow"
                >
                  {removeMemberMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>Vô hiệu hóa</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
