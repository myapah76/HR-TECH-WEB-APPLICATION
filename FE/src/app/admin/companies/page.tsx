'use client'

import { toast } from 'sonner'
import Image from 'next/image'
import Badge from '@/src/components/ui/Badge'
import SearchInput from '@/src/components/common/SearchInput'
import {
  Building2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import { useUrlFilter } from '@/src/hooks/useUrlFilter'
import {
  useGetAdminCompanies,
  useApproveCompany,
  useRejectCompany,
  useDeleteCompanyForAdmin,
  useRestoreCompany,
} from '@/src/hooks/admin-company'

const STATUS_LABELS: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  VERIFYING: { label: 'Đang xác minh', variant: 'warning' },
  APPROVED: { label: 'Đã duyệt', variant: 'success' },
  REJECTED: { label: 'Từ chối', variant: 'danger' },
  SUSPENDED: { label: 'Đình chỉ', variant: 'default' },
}

export default function CompaniesPage() {
  const {
    keywordInput: searchKeyword,
    setKeywordInput: setSearchKeyword,
    urlKeyword,
    urlPage: pageNumber,
    urlSize: size,
    updateUrlParams,
  } = useUrlFilter({
    defaultPage: 1,
    defaultSize: 10,
  })

  const page = pageNumber - 1
  const { data: companiesPage, isLoading } = useGetAdminCompanies(urlKeyword, page, size)
  const totalPages = companiesPage?.page?.totalPages ?? 0
  const totalElements = companiesPage?.page?.totalElements ?? 0

  const approveMutation = useApproveCompany()
  const rejectMutation = useRejectCompany()
  const deleteMutation = useDeleteCompanyForAdmin()
  const restoreMutation = useRestoreCompany()

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id)
      toast.success('Phê duyệt công ty thành công!')
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi phê duyệt công ty.')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync(id)
      toast.success('Từ chối công ty thành công!')
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi từ chối công ty.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá công ty này khỏi hệ thống?')) {
      return
    }
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Xoá công ty thành công!')
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi xoá công ty.')
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreMutation.mutateAsync(id)
      toast.success('Khôi phục hoạt động công ty thành công!')
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi khôi phục công ty.')
    }
  }

  const companies = companiesPage?.content ?? []

  return (
    <div className="font-sans">
      {/* Search Filter Bar */}
      <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs">
        <SearchInput
          value={searchKeyword}
          onChange={(v) => {
            setSearchKeyword(v)
            updateUrlParams({ keyword: v || undefined })
          }}
          placeholder="Tìm kiếm công ty theo tên, mô tả..."
          className="flex-1"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-xs font-bold">Đang tải danh sách công ty...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-xs font-bold">Không tìm thấy công ty nào phù hợp.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Công ty</th>
                  <th className="p-4">Ngành / MST</th>
                  <th className="p-4">Quy mô</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => {
                  const isCompDeleted = c.isDeleted
                  const statusInfo = isCompDeleted
                    ? { label: 'Đã xoá', variant: 'danger' as const }
                    : STATUS_LABELS[c.status] || {
                        label: c.status || 'Chờ duyệt',
                        variant: 'default' as const,
                      }
                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-slate-50 hover:bg-slate-50/50 ${isCompDeleted ? 'opacity-60 bg-slate-50/20' : ''}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {c.logoUrl ? (
                            <Image
                              src={c.logoUrl}
                              alt={c.name}
                              width={36}
                              height={36}
                              unoptimized
                              className="h-9 w-9 rounded-lg object-contain bg-white border border-slate-150 p-0.5"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-sm flex items-center justify-center">
                              {c.name ? c.name.charAt(0) : 'C'}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-extrabold text-slate-800">{c.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              {c.website || 'Chưa cập nhật website'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-xs font-bold text-slate-700">
                          {c.industry || 'Lĩnh vực công nghệ'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-extrabold mt-0.5">
                          MST: {c.taxCode || 'N/A'}
                        </p>
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-600">
                        {c.size || 'Chưa cập nhật'}
                      </td>
                      <td className="p-4">
                        <Badge variant={statusInfo.variant} size="md">
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1.5">
                          {isCompDeleted ? (
                            <button
                              onClick={() => handleRestore(c.id)}
                              disabled={restoreMutation.isPending}
                              className="p-1.5 text-blue-500 hover:text-blue-650 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                              title="Khôi phục hoạt động"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              {c.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(c.id)}
                                    disabled={approveMutation.isPending}
                                    className="p-1.5 text-emerald-400 hover:text-emerald-650 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                                    title="Phê duyệt"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(c.id)}
                                    disabled={rejectMutation.isPending}
                                    className="p-1.5 text-amber-500 hover:text-amber-650 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                                    title="Từ chối"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDelete(c.id)}
                                disabled={deleteMutation.isPending}
                                className="p-1.5 text-rose-450 hover:text-rose-650 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                                title="Xoá"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">
                  Hiển thị <span className="text-slate-800 font-bold">{companies.length}</span> trên{' '}
                  <span className="text-slate-800 font-bold">{totalElements}</span> doanh nghiệp
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => updateUrlParams({ page: pageNumber - 1 })}
                    className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => updateUrlParams({ page: pageNumber + 1 })}
                    className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
