'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Badge from '@/src/components/ui/Badge'
import Pagination from '@/src/components/common/Pagination'
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  X,
  MapPin,
  DollarSign,
  Calendar,
  Award,
  Lock,
  ChevronDown,
} from 'lucide-react'
import { useGetJobReport, useApproveAppealAdmin, useRejectAppealAdmin } from '@/src/hooks/job'
import {
  JobStatus,
  JOB_STATUS_LABELS,
  JOB_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from '@/src/enums/job.enum'
import { formatSalary } from '@/src/utils/salary'
import { Job } from '@/src/types/job'
import RejectionReasonDisplay from '@/src/components/company/job/RejectionReasonDisplay'

const getStatusBadgeVariant = (status: JobStatus) => {
  switch (status) {
    case JobStatus.APPROVED:
    case JobStatus.OPEN:
      return 'success'
    case JobStatus.PENDING_APPROVAL:
      return 'info'
    case JobStatus.DRAFT:
      return 'warning'
    case JobStatus.REJECTED:
      return 'danger'
    case JobStatus.CLOSED:
    default:
      return 'outline'
  }
}

// Determine which status transitions are available for admin
// NOTE: 'submit' (DRAFT→PENDING) is the HR's action, not admin's
type TransitionAction = 'approve' | 'reject'
interface StatusTransition {
  action: TransitionAction
  label: string
  icon: React.ReactNode
  colorClass: string
  hoverClass: string
  bgClass: string
}

const getAvailableTransitions = (status: JobStatus): StatusTransition[] => {
  switch (status) {
    case JobStatus.APPEALED:
      return [
        {
          action: 'approve',
          label: 'Duyệt khiếu nại',
          icon: <CheckCircle className="h-3.5 w-3.5" />,
          colorClass: 'text-emerald-500',
          hoverClass: 'hover:text-emerald-700',
          bgClass: 'hover:bg-emerald-50',
        },
        {
          action: 'reject',
          label: 'Bác bỏ khiếu nại',
          icon: <XCircle className="h-3.5 w-3.5" />,
          colorClass: 'text-rose-500',
          hoverClass: 'hover:text-rose-700',
          bgClass: 'hover:bg-rose-50',
        },
      ]
    default:
      return []
  }
}

interface ConfirmState {
  job: Job
  action: TransitionAction
}

const TRANSITION_CONFIG: Record<
  TransitionAction,
  {
    title: string
    description: string
    confirmLabel: string
    confirmClass: string
    iconBg: string
    iconColor: string
    icon: React.ReactNode
  }
> = {
  approve: {
    title: 'Phê duyệt khiếu nại',
    description:
      'Chấp nhận khiếu nại tuyển dụng. Tin tuyển dụng sẽ được chuyển trạng thái sang đã duyệt và hiển thị công khai trên hệ thống.',
    confirmLabel: 'Duyệt khiếu nại',
    confirmClass: 'bg-emerald-600 hover:bg-emerald-700',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    icon: <CheckCircle className="h-5 w-5" />,
  },
  reject: {
    title: 'Bác bỏ khiếu nại',
    description:
      'Bác bỏ yêu cầu khiếu nại. Tin tuyển dụng sẽ được đưa về trạng thái từ chối để HR cập nhật lại nội dung phù hợp.',
    confirmLabel: 'Bác bỏ khiếu nại',
    confirmClass: 'bg-rose-600 hover:bg-rose-700',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    icon: <XCircle className="h-5 w-5" />,
  },
}

function JobsManagementContent() {
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)

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

  const handleTransition = async () => {
    if (!confirmState) return
    const { job, action } = confirmState
    try {
      if (action === 'approve') {
        await approveMutation.mutateAsync(job.id)
      } else if (action === 'reject') {
        await rejectMutation.mutateAsync(job.id)
      }
      const cfg = TRANSITION_CONFIG[action]
      toast.success(`${cfg.confirmLabel} thành công: ${job.title}`)
      setConfirmState(null)
      setSelectedJob(null)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi chuyển trạng thái')
    }
  }

  const openTransitionDialog = (job: Job, action: TransitionAction) => {
    setConfirmState({ job, action })
    setSelectedJob(null)
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
                <th className="p-4">Ngày đăng</th>
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
                jobsList.map((job) => {
                  const transitions = getAvailableTransitions(job.status)
                  return (
                    <tr
                      key={job.id}
                      className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors"
                    >
                      {/* Job title */}
                      <td className="p-4 max-w-80">
                        <p
                          className="text-xs font-extrabold text-slate-800 hover:text-violet-600 transition-colors cursor-pointer line-clamp-1"
                          onClick={() => setSelectedJob(job)}
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
                            <img
                              src={job.companyLogoUrl}
                              alt={job.companyName}
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
                        <div className="flex items-center justify-end gap-1">
                          {/* Detail */}
                          <button
                            type="button"
                            onClick={() => setSelectedJob(job)}
                            title="Xem chi tiết"
                            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Status transition buttons */}
                          {transitions.map((t) => (
                            <button
                              key={t.action}
                              type="button"
                              title={t.label}
                              onClick={() => openTransitionDialog(job, t.action)}
                              className={`p-1.5 ${t.colorClass} ${t.hoverClass} ${t.bgClass} rounded-lg cursor-pointer transition-colors`}
                            >
                              {t.icon}
                            </button>
                          ))}

                          {/* No transitions available label */}
                          {transitions.length === 0 && job.status === JobStatus.CLOSED && (
                            <span className="text-[10px] font-bold text-slate-300 px-1">
                              Đã đóng
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
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

      {/* ── Job Detail Modal ── */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                {selectedJob.companyLogoUrl ? (
                  <img
                    src={selectedJob.companyLogoUrl}
                    alt={selectedJob.companyName}
                    className="h-10 w-10 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-500">
                    {selectedJob.companyName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">
                    {selectedJob.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs font-semibold text-slate-500">
                      {selectedJob.companyName}
                    </p>
                    <Badge variant={getStatusBadgeVariant(selectedJob.status)} size="sm">
                      {JOB_STATUS_LABELS[selectedJob.status] || selectedJob.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Mức Lương</span>
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                    <DollarSign className="h-3 w-3 text-emerald-500 shrink-0" />
                    {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Loại Hình</span>
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                    <Briefcase className="h-3 w-3 text-indigo-500 shrink-0" />
                    {JOB_TYPE_LABELS[selectedJob.jobType] || selectedJob.jobType}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase">
                    Kinh Nghiệm
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                    <Award className="h-3 w-3 text-amber-500 shrink-0" />
                    {EXPERIENCE_LEVEL_LABELS[selectedJob.experienceLevel] ||
                      selectedJob.experienceLevel}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Hạn Nộp</span>
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3 text-rose-500 shrink-0" />
                    {selectedJob.deadline
                      ? new Date(selectedJob.deadline).toLocaleDateString('vi-VN')
                      : 'Không giới hạn'}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-4 text-slate-600 leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
                    Địa điểm làm việc
                  </h4>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {selectedJob.location}
                  </p>
                </div>

                {selectedJob.description && (
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
                      Mô tả công việc
                    </h4>
                    <p className="whitespace-pre-line bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      {selectedJob.description}
                    </p>
                  </div>
                )}

                {selectedJob.requirements && (
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
                      Yêu cầu công việc
                    </h4>
                    <p className="whitespace-pre-line bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      {selectedJob.requirements}
                    </p>
                  </div>
                )}

                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider mb-2">
                      Kỹ năng yêu cầu
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="inline-flex items-center bg-violet-50/60 text-violet-700 border border-violet-100 rounded-lg px-2.5 py-1 text-xs font-semibold gap-1"
                        >
                          <span>{skill.skillName}</span>
                          <span className="text-[10px] bg-violet-200/50 text-violet-800 px-1 rounded-sm">
                            Lv: {skill.requiredLevel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer — transition actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              {/* Status flow indicator */}
              <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
                {[
                  JobStatus.DRAFT,
                  JobStatus.PENDING_APPROVAL,
                  JobStatus.APPROVED,
                  JobStatus.CLOSED,
                ].map((s, idx, arr) => (
                  <div key={s} className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        selectedJob.status === s
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'text-slate-400 border-slate-200'
                      }`}
                    >
                      {JOB_STATUS_LABELS[s]}
                    </span>
                    {idx < arr.length - 1 && (
                      <ChevronDown className="h-3 w-3 text-slate-300 -rotate-90" />
                    )}
                  </div>
                ))}
                {selectedJob.status === JobStatus.REJECTED && (
                  <>
                    <span className="text-[10px] text-slate-300 font-bold">|</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full border bg-rose-600 text-white border-rose-600">
                      {JOB_STATUS_LABELS[JobStatus.REJECTED]}
                    </span>
                  </>
                )}
              </div>

              {selectedJob.rejectionReason && (
                <div className="mb-4">
                  <RejectionReasonDisplay reason={selectedJob.rejectionReason} />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Đóng
                </button>

                {getAvailableTransitions(selectedJob.status).map((t) => (
                  <button
                    key={t.action}
                    type="button"
                    onClick={() => openTransitionDialog(selectedJob, t.action)}
                    className={`rounded-xl px-4 py-2 text-xs font-extrabold text-white flex items-center gap-1.5 transition-colors ${
                      t.action === 'approve'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : t.action === 'reject'
                          ? 'bg-rose-600 hover:bg-rose-700'
                          : t.action === 'close'
                            ? 'bg-slate-700 hover:bg-slate-900'
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}

                {getAvailableTransitions(selectedJob.status).length === 0 && (
                  <span className="text-xs font-bold text-slate-400 italic">
                    Không có thao tác chuyển trạng thái
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Transition Confirmation Modal ── */}
      {confirmState &&
        (() => {
          const cfg = TRANSITION_CONFIG[confirmState.action]
          const isPending = approveMutation.isPending || rejectMutation.isPending
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
              <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="mb-4 flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg} ${cfg.iconColor}`}
                  >
                    {cfg.icon}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{cfg.title}</p>
                    <p className="text-xs font-semibold text-slate-500 line-clamp-1">
                      {confirmState.job.title}
                    </p>
                  </div>
                </div>

                <p className="mb-5 text-xs font-semibold leading-5 text-slate-600">
                  {cfg.description}
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmState(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleTransition}
                    disabled={isPending || isAnyPending}
                    className={`rounded-lg px-4 py-2 text-xs font-extrabold text-white transition disabled:opacity-60 ${cfg.confirmClass}`}
                  >
                    {isPending ? 'Đang xử lý...' : cfg.confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
    </div>
  )
}

export default function JobsManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-100 flex-col items-center justify-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          <span className="text-xs font-bold text-slate-400">Đang tải trang quản lý tin...</span>
        </div>
      }
    >
      <JobsManagementContent />
    </Suspense>
  )
}
