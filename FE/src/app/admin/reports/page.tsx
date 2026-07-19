'use client'

import { useEffect, useState, useMemo, Suspense, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Badge from '@/src/components/ui/Badge'
import Pagination from '@/src/components/common/Pagination'
import { Briefcase, Search, X, MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react'
import { useGetJobReport, useApproveAppealAdmin, useRejectAppealAdmin } from '@/src/hooks/job'
import {
  JobStatus,
  JOB_STATUS_LABELS,
  JOB_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  getStatusBadgeVariant,
} from '@/src/enums/job.enum'
import { formatSalary } from '@/src/utils/salary'
import { Job } from '@/src/types/job'
import JobPreviewModal from '@/components/common/JobPreviewModal'
import ConfirmModal from '@/components/common/ConfirmModal'
import JobRejectModal from '@/components/common/JobRejectModal'

type ConfirmActionType = 'approve' | 'reject'

interface ConfirmActionState {
  job: Job
  type: ConfirmActionType
}

function ReportsManagementContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get filter state from URL params
  const urlKeyword = searchParams.get('keyword') || ''
  const urlPage = parseInt(searchParams.get('page') || '1', 10)
  const urlSize = parseInt(searchParams.get('size') || '10', 10)

  const [keywordInput, setKeywordInput] = useState(urlKeyword)

  useEffect(() => {
    setTimeout(() => {
      setKeywordInput(urlKeyword)
    }, 0)
  }, [urlKeyword])

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: urlPage - 1,
      size: urlSize,
    }
    if (urlKeyword.trim()) params.keyword = urlKeyword.trim()
    return params
  }, [urlKeyword, urlPage, urlSize])

  const { data: jobsPage, isLoading, isError, refetch } = useGetJobReport(queryParams)

  // Mutations
  const approveMutation = useApproveAppealAdmin()
  const rejectMutation = useRejectAppealAdmin()

  // UI state
  const [previewJob, setPreviewJob] = useState<Job | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectReasonError, setRejectReasonError] = useState('')

  // Dropdown states for actions
  const [openMenuJobId, setOpenMenuJobId] = useState<string | null>(null)
  const [openMenuDirection, setOpenMenuDirection] = useState<'up' | 'down'>('down')
  const [menuTriggerRect, setMenuTriggerRect] = useState<DOMRect | null>(null)

  const toggleMenu = (jobId: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (openMenuJobId === jobId) {
      closeMenu()
    } else {
      const rect = event.currentTarget.getBoundingClientRect()
      setMenuTriggerRect(rect)
      setOpenMenuJobId(jobId)
      const spaceBelow = window.innerHeight - rect.bottom
      if (spaceBelow < 180) {
        setOpenMenuDirection('up')
      } else {
        setOpenMenuDirection('down')
      }
    }
  }

  const closeMenu = () => {
    setOpenMenuJobId(null)
    setMenuTriggerRect(null)
  }

  useEffect(() => {
    const handleClose = () => {
      closeMenu()
    }
    if (openMenuJobId) {
      window.addEventListener('scroll', handleClose, true)
      window.addEventListener('resize', handleClose)
    }
    return () => {
      window.removeEventListener('scroll', handleClose, true)
      window.removeEventListener('resize', handleClose)
    }
  }, [openMenuJobId])

  const updateUrlParams = (newParams: {
    keyword?: string
    status?: string
    page?: number
    size?: number
  }) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newParams.keyword !== undefined) {
      if (newParams.keyword.trim()) params.set('keyword', newParams.keyword.trim())
      else params.delete('keyword')
      params.set('page', '1')
    }
    if (newParams.status !== undefined) {
      if (newParams.status && newParams.status !== 'ALL') params.set('status', newParams.status)
      else params.delete('status')
      params.set('page', '1')
    }
    if (newParams.page !== undefined) params.set('page', String(newParams.page))
    if (newParams.size !== undefined) params.set('size', String(newParams.size))
    router.push(`${pathname}?${params.toString()}`)
  }

  const executeTransition = async () => {
    if (!confirmAction) return
    const { job, type } = confirmAction
    try {
      if (type === 'approve') {
        await approveMutation.mutateAsync(job.id)
        toast.success(`Duyệt khiếu nại thành công: ${job.title}`)
      } else if (type === 'reject') {
        if (!rejectReason.trim()) {
          setRejectReasonError('Lý do bác bỏ không được để trống')
          return
        }
        if (rejectReason.trim().length < 10) {
          setRejectReasonError('Lý do bác bỏ phải có ít nhất 10 ký tự')
          return
        }
        await rejectMutation.mutateAsync({ jobId: job.id, reason: rejectReason.trim() })
        toast.success(`Bác bỏ khiếu nại thành công: ${job.title}`)
      }
      setConfirmAction(null)
      setRejectReason('')
      setRejectReasonError('')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi chuyển trạng thái')
    }
  }

  const openApproveConfirm = (job: Job) => {
    setConfirmAction({ job, type: 'approve' })
    closeMenu()
  }

  const openRejectConfirm = (job: Job) => {
    setConfirmAction({ job, type: 'reject' })
    setRejectReason('')
    setRejectReasonError('')
    closeMenu()
  }

  const jobsList = jobsPage?.content || []
  const totalElements = jobsPage?.page?.totalElements ?? 0
  const totalPages = Math.max(1, jobsPage?.page?.totalPages ?? 1)
  const safeCurrentPage = Math.min(urlPage, totalPages)

  const isAnyPending = approveMutation.isPending || rejectMutation.isPending

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-violet-600" />
            Quản lý khiếu nại tin tuyển dụng
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Xem xét và giải quyết các khiếu nại tin đăng tuyển dụng bị AI đánh dấu vi phạm
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-xs md:grid-cols-[1fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            updateUrlParams({ keyword: keywordInput })
          }}
          className="relative block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Tìm theo tiêu đề khiếu nại hoặc tên công ty... (Nhấn Enter)"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-12 text-xs font-bold text-slate-700 outline-hidden transition focus:border-violet-500 focus:ring-2 focus:ring-violet-50"
          />
          {keywordInput && (
            <button
              type="button"
              onClick={() => {
                setKeywordInput('')
                updateUrlParams({ keyword: '' })
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-220 border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-50/50">
                <th className="p-4">Vị trí</th>
                <th className="p-4">Công ty</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4">Hạn nộp</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs font-bold text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                      <span>Đang tải danh sách tin tuyển dụng...</span>
                    </div>
                  </td>
                </tr>
              )}

              {isError && !isLoading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <p className="mb-3 text-xs font-bold text-rose-500">
                      Không thể tải danh sách tin tuyển dụng
                    </p>
                    <button
                      onClick={() => refetch()}
                      className="rounded-lg bg-slate-950 px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-slate-800"
                    >
                      Thử lại
                    </button>
                  </td>
                </tr>
              )}

              {!isLoading && !isError && jobsList.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xs font-bold text-slate-400">
                    Không có tin tuyển dụng nào phù hợp với bộ lọc
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                jobsList.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors"
                  >
                    {/* Job title */}
                    <td className="p-4 max-w-80">
                      <p
                        className="text-xs font-extrabold text-slate-800 hover:text-violet-600 transition-colors cursor-pointer line-clamp-1"
                        onClick={() => setPreviewJob(job)}
                      >
                        {job.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
                          {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                        </span>
                        <span>•</span>
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">
                          {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
                        </span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        {job.companyLogoUrl ? (
                          <Image
                            src={job.companyLogoUrl}
                            alt={job.companyName || 'Company Logo'}
                            width={32}
                            height={32}
                            unoptimized
                            className="h-8 w-8 rounded-lg object-cover border border-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-500">
                            {job.companyName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-700 line-clamp-1">
                            {job.companyName}
                          </p>
                          <p className="text-[9px] font-extrabold text-emerald-600">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Created At */}
                    <td className="p-4 text-xs font-semibold text-slate-500">
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>

                    {/* Deadline */}
                    <td className="p-4 text-xs font-semibold text-slate-500">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : '—'}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <Badge variant={getStatusBadgeVariant(job.status)} size="md">
                        {JOB_STATUS_LABELS[job.status] || job.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={(event) => toggleMenu(job.id, event)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900"
                          aria-expanded={openMenuJobId === job.id}
                          aria-haspopup="menu"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          Thao tác
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={totalElements}
          itemsPerPage={urlSize}
          onPageChange={(page) => updateUrlParams({ page })}
          onItemsPerPageChange={(size) => updateUrlParams({ size })}
        />
      )}

      {/* ── Job Detail Modal (Reusing JobPreviewModal) ── */}
      {previewJob && <JobPreviewModal job={previewJob} onClose={() => setPreviewJob(null)} />}

      {/* ── Approve Confirmation Modal (Reusing ConfirmModal) ── */}
      {confirmAction && confirmAction.type === 'approve' && (
        <ConfirmModal
          isOpen={true}
          title="Phê duyệt khiếu nại?"
          description="Chấp nhận khiếu nại tuyển dụng. Tin tuyển dụng sẽ được chuyển trạng thái sang đã duyệt và hiển thị công khai trên hệ thống."
          confirmText="Duyệt khiếu nại"
          variant="success"
          onClose={() => setConfirmAction(null)}
          onConfirm={executeTransition}
          isLoading={isAnyPending}
        />
      )}

      {/* ── Reject Rejection Modal (Reusing JobRejectModal) ── */}
      {confirmAction && confirmAction.type === 'reject' && (
        <JobRejectModal
          job={confirmAction.job}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          rejectReasonError={rejectReasonError}
          setRejectReasonError={setRejectReasonError}
          title="Bác bỏ khiếu nại?"
          description={`Bác bỏ yêu cầu khiếu nại tuyển dụng. Tin tuyển dụng "${confirmAction.job.title}" sẽ được chuyển sang trạng thái từ chối và HR sẽ nhìn thấy lý do này.`}
          confirmLabel="Bác bỏ khiếu nại"
          placeholder="Nhập lý do chi tiết bác bỏ khiếu nại (ví dụ: Tin tuyển dụng chứa thông tin liên hệ trực tiếp, yêu cầu không rõ ràng...)"
          onClose={() => setConfirmAction(null)}
          onConfirm={executeTransition}
          isPending={isAnyPending}
        />
      )}

      {(() => {
        const activeJob = jobsList.find((j) => j.id === openMenuJobId)
        if (!activeJob || !menuTriggerRect || typeof document === 'undefined') return null

        return createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default bg-transparent w-full h-full border-0 outline-none"
              aria-label="Đóng menu thao tác"
              onClick={closeMenu}
            />
            <div
              className="fixed z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-100"
              style={{
                ...(openMenuDirection === 'down'
                  ? { top: `${menuTriggerRect.bottom + 6}px` }
                  : { bottom: `${window.innerHeight - menuTriggerRect.top + 6}px` }),
                left: `${menuTriggerRect.right - 192}px`,
              }}
            >
              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    closeMenu()
                    setPreviewJob(activeJob)
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                  Xem chi tiết
                </button>

                {activeJob.status === JobStatus.APPEALED && (
                  <>
                    <button
                      type="button"
                      onClick={() => openApproveConfirm(activeJob)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors mt-0.5 text-emerald-700 hover:bg-emerald-50"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Duyệt khiếu nại
                    </button>
                    <button
                      type="button"
                      onClick={() => openRejectConfirm(activeJob)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors mt-0.5 text-rose-700 hover:bg-rose-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Bác bỏ khiếu nại
                    </button>
                  </>
                )}
              </div>
            </div>
          </>,
          document.body
        )
      })()}
    </div>
  )
}

export default function ReportsManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-100 flex-col items-center justify-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          <span className="text-xs font-bold text-slate-400">Đang tải trang quản lý tin...</span>
        </div>
      }
    >
      <ReportsManagementContent />
    </Suspense>
  )
}
