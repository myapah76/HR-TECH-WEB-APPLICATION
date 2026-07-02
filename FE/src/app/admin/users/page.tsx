'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import PageHeader from '@/src/components/ui/PageHeader'
import Badge from '@/src/components/ui/Badge'
import Pagination from '@/src/components/common/Pagination'
import { RoleUser } from '@/src/enums/role.enum'
import { useGetUsers, useUpdateUserBlockedStatus } from '@/src/hooks/user'
import { useAuthStore } from '@/src/stores/auth.store'
import { AdminUsersParams, User } from '@/src/types/user'
import { getErrorMessage } from '@/src/utils'
import { AlertTriangle, Lock, Search, Shield, Unlock, Users, X } from 'lucide-react'

type BlockedFilter = 'ALL' | 'ACTIVE' | 'BLOCKED'

const DEFAULT_PAGE_SIZE = 10

const roleLabels: Record<RoleUser, string> = {
  [RoleUser.CANDIDATE]: 'Ứng viên',
  [RoleUser.RECRUITER]: 'Nhà tuyển dụng',
  [RoleUser.ADMIN_SYSTEM]: 'Quản trị viên',
}

const getRoleBadgeVariant = (role?: string) => {
  if (role === RoleUser.ADMIN_SYSTEM) return 'info'
  if (role === RoleUser.RECRUITER) return 'success'
  return 'default'
}

const getFullName = (user: User) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return fullName || user.username || 'Chưa cập nhật tên'
}

const isAdminRole = (role?: string) => role === RoleUser.ADMIN_SYSTEM || role === 'ADMIN'

export default function UsersPage() {
  const currentUser = useAuthStore((state) => state.user)
  const [emailSearch, setEmailSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | RoleUser>('ALL')
  const [blockedFilter, setBlockedFilter] = useState<BlockedFilter>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [confirmUser, setConfirmUser] = useState<User | null>(null)

  const queryParams = useMemo<AdminUsersParams>(() => {
    const params: AdminUsersParams = {
      page: currentPage - 1,
      size: itemsPerPage,
    }
    const trimmedEmail = emailSearch.trim()

    if (trimmedEmail) params.email = trimmedEmail
    if (roleFilter !== 'ALL') params.role = roleFilter
    if (blockedFilter !== 'ALL') params.isBlocked = blockedFilter === 'BLOCKED'

    return params
  }, [blockedFilter, currentPage, emailSearch, itemsPerPage, roleFilter])

  const { data: usersPage, isLoading, isError, refetch } = useGetUsers(queryParams)
  const updateBlockedStatus = useUpdateUserBlockedStatus()
  const users = usersPage?.content ?? []
  const totalElements = usersPage?.totalElements ?? 0
  const totalPages = Math.max(1, usersPage?.totalPages ?? 1)
  const safeCurrentPage = Math.min(currentPage, totalPages)

  useEffect(() => {
    if (usersPage && usersPage.totalPages > 0 && currentPage > usersPage.totalPages) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(usersPage.totalPages)
    }
  }, [currentPage, usersPage])

  const updateFilter = (callback: () => void) => {
    callback()
    setCurrentPage(1)
  }

  const handleRequestToggleBlocked = (user: User) => {
    if (user.id === currentUser?.id) return
    if (isAdminRole(user.roleResponse?.name)) return
    setConfirmUser(user)
  }

  const handleConfirmToggleBlocked = async () => {
    if (!confirmUser || confirmUser.id === currentUser?.id) return
    if (isAdminRole(confirmUser.roleResponse?.name)) return

    setUpdatingUserId(confirmUser.id)
    try {
      await updateBlockedStatus.mutateAsync({
        userId: confirmUser.id,
        isBlocked: !confirmUser.isBlocked,
      })
      toast.success(confirmUser.isBlocked ? 'Đã mở khóa người dùng' : 'Đã khóa người dùng')
      setConfirmUser(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setUpdatingUserId(null)
    }
  }

  const confirmActionLabel = confirmUser?.isBlocked ? 'mở khóa' : 'khóa'

  return (
    <div className="max-w-6xl">
      <PageHeader
        icon={Users}
        title="Quản lý người dùng"
        subtitle={`${totalElements} người dùng phù hợp`}
      />

      <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-xs md:grid-cols-[1fr_180px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={emailSearch}
            onChange={(event) => updateFilter(() => setEmailSearch(event.target.value))}
            placeholder="Tìm theo email"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
          />
        </label>

        <select
          value={roleFilter}
          onChange={(event) => updateFilter(() => setRoleFilter(event.target.value as 'ALL' | RoleUser))}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
        >
          <option value="ALL">Tất cả vai trò</option>
          {Object.values(RoleUser).map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </select>

        <select
          value={blockedFilter}
          onChange={(event) => updateFilter(() => setBlockedFilter(event.target.value as BlockedFilter))}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="BLOCKED">Đã khóa</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="p-4">Người dùng</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-xs font-bold text-slate-400">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              )}

              {isError && !isLoading && (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <p className="mb-3 text-xs font-bold text-rose-500">
                      Không thể tải danh sách người dùng
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-slate-700"
                    >
                      Thử lại
                    </button>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-xs font-bold text-slate-400">
                    Không có người dùng phù hợp với bộ lọc
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                users.map((user) => {
                  const role = user.roleResponse?.name as RoleUser | undefined
                  const isCurrentUser = user.id === currentUser?.id
                  const isAdminUser = isAdminRole(user.roleResponse?.name)
                  const isUpdating = updatingUserId === user.id
                  const actionLabel = user.isBlocked ? 'Mở khóa người dùng' : 'Khóa người dùng'
                  const disabledReason = isCurrentUser
                    ? 'Không thể tự khóa/mở khóa tài khoản hiện tại'
                    : isAdminUser
                      ? 'Quản trị viên không thể bị khóa'
                      : actionLabel

                  return (
                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500">
                            {getFullName(user).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-800">{getFullName(user)}</p>
                            <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getRoleBadgeVariant(role)} size="md">
                          <Shield className="mr-1 inline h-3 w-3" />
                          {role ? roleLabels[role] : 'Chưa có vai trò'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.isBlocked ? 'danger' : 'success'} size="md">
                          {user.isBlocked ? 'Đã khóa' : 'Đang hoạt động'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleRequestToggleBlocked(user)}
                          disabled={isCurrentUser || isAdminUser || isUpdating}
                          title={disabledReason}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            user.isBlocked
                              ? 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                              : 'text-rose-500 hover:bg-rose-50 hover:text-rose-700'
                          } disabled:pointer-events-none disabled:opacity-35`}
                        >
                          {user.isBlocked ? (
                            <Unlock className="h-3.5 w-3.5" />
                          ) : (
                            <Lock className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && !isError && (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={totalElements}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {confirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800">
                    Xác nhận {confirmActionLabel} người dùng
                  </p>
                  <p className="text-xs font-semibold text-slate-500">{confirmUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmUser(null)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-5 text-xs font-semibold leading-5 text-slate-600">
              Bạn có chắc chắn muốn {confirmActionLabel} tài khoản {getFullName(confirmUser)} không?
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmUser(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleBlocked}
                disabled={updatingUserId === confirmUser.id}
                className={`rounded-lg px-4 py-2 text-xs font-extrabold text-white transition disabled:opacity-60 ${
                  confirmUser.isBlocked
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmUser.isBlocked ? 'Mở khóa' : 'Khóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
