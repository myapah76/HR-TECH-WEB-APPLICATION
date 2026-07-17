'use client'

import Link from 'next/link'
import { useState, type MouseEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CircleX, Copy, Eye, Loader2, MapPin, MoreHorizontal, Pencil, Send } from 'lucide-react'
import { toast } from 'sonner'

import {
  useCreateJobMutation,
  useDeleteJobMutation,
  useUpdateJobStatusMutation,
} from '@/src/hooks/job'
import { CompanyMemberResponse } from '@/src/types/company'
import { CreateJobRequest, Job } from '@/src/types/job'
import { formatDate, formatSalary } from '@/src/utils'
import {
  EXPERIENCE_LEVEL_LABELS,
  JobStatus,
  JOB_TYPE_LABELS,
  JOB_STATUS_LABELS,
  JOB_STATUS_STYLES,
} from '@/src/enums/job.enum'

interface ManageJobTableProps {
  jobs: Job[]
  currentUserId?: string
  companyRole?: CompanyMemberResponse['role']
}

type ConfirmActionType = 'approve' | 'duplicate' | 'delete' | 'close'

type ConfirmActionState = {
  type: ConfirmActionType
  title: string
  description: string
  confirmLabel: string
  confirmTone: 'blue' | 'emerald' | 'rose'
  onConfirm: () => void
}

export default function ManageJobTable({ jobs, currentUserId, companyRole }: ManageJobTableProps) {
  const router = useRouter()
  const [jobToClose, setJobToClose] = useState<Job | null>(null)
  const [jobToReject, setJobToReject] = useState<Job | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectReasonError, setRejectReasonError] = useState('')
  const [previewJob, setPreviewJob] = useState<Job | null>(null)
  const [openMenuJobId, setOpenMenuJobId] = useState<string | null>(null)
  const [openMenuDirection, setOpenMenuDirection] = useState<'up' | 'down'>('down')
  const [deadlineHasNotEnded, setDeadlineHasNotEnded] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null)
  const createJobMutation = useCreateJobMutation()
  const deleteJobMutation = useDeleteJobMutation()
  const statusMutation = useUpdateJobStatusMutation()

  const buildDuplicatePayload = (job: Job): CreateJobRequest => ({
    companyId: job.companyId,
    title: `Bản sao - ${job.title}`,
    position: job.position,
    description: job.description,
    location: job.location,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    jobType: job.jobType,
    experienceLevel: job.experienceLevel,
    deadline: job.deadline,
    requirements: job.requirements,
    skills: job.skills.map((skill) =>
      skill.requiredLevel
        ? {
            skillNeo4jId: skill.skillNeo4jId,
            requiredLevel: skill.requiredLevel,
          }
        : { skillNeo4jId: skill.skillNeo4jId }
    ),
  })

  const duplicateJob = (job: Job) => {
    createJobMutation.mutate(buildDuplicatePayload(job), {
      onSuccess: (newJob) => {
        toast.success('Đã tạo bản sao tin tuyển dụng ở trạng thái nháp!')
        router.push(`/recruiter/manage-jobs/${newJob.id}/update`)
      },
    })
  }

  const submitJob = (job: Job) => {
    statusMutation.mutate(
      { jobId: job.id, action: 'submit', companyId: job.companyId },
      { onSuccess: () => toast.success('Đã nộp tin tuyển dụng để chờ phê duyệt!') }
    )
  }

  const closeJob = () => {
    if (!jobToClose) return

    statusMutation.mutate(
      { jobId: jobToClose.id, action: 'close', companyId: jobToClose.companyId },
      {
        onSuccess: () => {
          toast.success('Đã đóng tin tuyển dụng!')
          setJobToClose(null)
        },
      }
    )
  }

  const openCloseConfirmation = (job: Job) => {
    setJobToClose(job)
    setDeadlineHasNotEnded(Boolean(job.deadline && new Date(job.deadline).getTime() > Date.now()))
    setOpenMenuJobId(null)
  }

  const openRejectConfirmation = (job: Job) => {
    setJobToReject(job)
    setRejectReason('')
    setRejectReasonError('')
    setOpenMenuJobId(null)
  }

  const closeRejectConfirmation = () => {
    setJobToReject(null)
    setRejectReason('')
    setRejectReasonError('')
  }

  const confirmRejectJob = () => {
    if (!jobToReject) return

    const normalizedReason = rejectReason.trim()
    if (!normalizedReason) {
      setRejectReasonError('Vui lòng nhập lý do từ chối.')
      return
    }

    setRejectReasonError('')
    statusMutation.mutate(
      {
        jobId: jobToReject.id,
        action: 'reject',
        companyId: jobToReject.companyId,
        reason: normalizedReason,
      },
      {
        onSuccess: () => {
          toast.success('Đã từ chối tin tuyển dụng!')
          closeRejectConfirmation()
        },
      }
    )
  }

  const openConfirmAction = (action: ConfirmActionState) => {
    setConfirmAction(action)
    setOpenMenuJobId(null)
  }

  const closeConfirmAction = () => setConfirmAction(null)

  const toggleMenu = (jobId: string, event: MouseEvent<HTMLButtonElement>) => {
    const triggerRect = event.currentTarget.getBoundingClientRect()
    const menuHeight = 320
    const openUp = window.innerHeight - triggerRect.bottom < menuHeight

    setOpenMenuDirection(openUp ? 'up' : 'down')
    setOpenMenuJobId((currentJobId) => (currentJobId === jobId ? null : jobId))
  }

  const closeMenu = () => setOpenMenuJobId(null)

  const openInternalPreview = (job: Job) => {
    setPreviewJob(job)
    closeMenu()
  }

  const closePreview = () => setPreviewJob(null)

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-4">Tin tuyển dụng</th>
                <th className="px-4 py-4">Địa điểm</th>
                <th className="px-4 py-4">Hình thức</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => {
                const isJobCreator = job.createdById?.toLowerCase() === currentUserId?.toLowerCase()
                const isManager = companyRole === 'HR_MANAGER'
                const isHr = companyRole === 'HR'
                const canSubmit =
                  job.status === JobStatus.DRAFT && (isJobCreator || isHr) && !isManager
                const canDirectApprove = job.status === JobStatus.DRAFT && isJobCreator && isManager
                const canDelete = job.status === JobStatus.DRAFT && (isJobCreator || isManager)
                const canEdit =
                  job.status === JobStatus.DRAFT ||
                  job.status === JobStatus.REJECTED ||
                  job.status === JobStatus.REJECTED_BY_ADMIN
                const canClose = job.status === JobStatus.APPROVED && (isJobCreator || isManager)
                const canReview = job.status === JobStatus.PENDING_APPROVAL && isManager
                const canOpenPublic =
                  job.status === JobStatus.APPROVED || job.status === JobStatus.OPEN
                const viewTitle = canOpenPublic ? 'Xem tin công khai' : 'Xem nội bộ'

                return (
                  <tr key={job.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-5">
                      <div className="max-w-80">
                        <p className="font-bold text-slate-900">{job.title}</p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {job.companyName || 'Chưa có tên công ty'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                        {job.location || 'Chưa cập nhật'}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm font-semibold text-slate-600">
                      {JOB_TYPE_LABELS[job.jobType] || job.jobType || 'Chưa cập nhật'}
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                          JOB_STATUS_STYLES[job.status] || JOB_STATUS_STYLES[JobStatus.CLOSED]
                        }`}
                      >
                        {JOB_STATUS_LABELS[job.status] || job.status || 'Chưa xác định'}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm font-medium text-slate-600">
                      {job.createdAt ? formatDate(job.createdAt) : 'Chưa cập nhật'}
                    </td>
                    <td className="px-6 py-5">
                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={(event) => toggleMenu(job.id, event)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                          aria-expanded={openMenuJobId === job.id}
                          aria-haspopup="menu"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          Thao tác
                        </button>

                        {openMenuJobId === job.id && (
                          <>
                            <button
                              type="button"
                              className="fixed inset-0 z-40 cursor-default"
                              aria-label="Đóng menu thao tác"
                              onClick={closeMenu}
                            />
                            <div
                              className={`absolute right-0 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)] ${
                                openMenuDirection === 'up'
                                  ? 'bottom-[calc(100%+0.5rem)]'
                                  : 'top-[calc(100%+0.5rem)]'
                              }`}
                            >
                              <div className="border-b border-slate-100 px-4 py-3">
                                <p className="truncate text-sm font-bold text-slate-900">
                                  {job.title}
                                </p>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">
                                  {JOB_STATUS_LABELS[job.status] || job.status || 'Chưa xác định'}
                                </p>
                              </div>

                              <div className="p-2">
                                {canOpenPublic ? (
                                  <Link
                                    href={`/jobs/${job.id}`}
                                    aria-label={`${viewTitle} ${job.title}`}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                    title={viewTitle}
                                    onClick={closeMenu}
                                  >
                                    <Eye className="h-4 w-4" />
                                    {viewTitle}
                                  </Link>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => openInternalPreview(job)}
                                    aria-label={`${viewTitle} ${job.title}`}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                    title={viewTitle}
                                  >
                                    <Eye className="h-4 w-4" />
                                    {viewTitle}
                                  </button>
                                )}

                                {canEdit && (
                                  <Link
                                    href={`/recruiter/manage-jobs/${job.id}/update`}
                                    aria-label={`Chỉnh sửa ${job.title}`}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
                                    title={
                                      job.status === JobStatus.DRAFT
                                        ? 'Chỉnh sửa tin'
                                        : 'Chỉnh sửa và gửi lại'
                                    }
                                    onClick={closeMenu}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    {job.status === JobStatus.DRAFT
                                      ? 'Chỉnh sửa'
                                      : 'Sửa và gửi lại'}
                                  </Link>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    closeMenu()
                                    openConfirmAction({
                                      type: 'duplicate',
                                      title: 'Tạo bản sao tin tuyển dụng?',
                                      description:
                                        'Bản sao sẽ được tạo ở trạng thái nháp để bạn có thể chỉnh sửa lại trước khi gửi.',
                                      confirmLabel: 'Tạo bản sao',
                                      confirmTone: 'blue',
                                      onConfirm: () => duplicateJob(job),
                                    })
                                  }}
                                  disabled={createJobMutation.isPending}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Tạo bản sao nháp"
                                >
                                  <Copy className="h-4 w-4" />
                                  Duplicate
                                </button>

                                {canSubmit && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      submitJob(job)
                                    }}
                                    disabled={statusMutation.isPending}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <Send className="h-4 w-4" />
                                    Nộp tin
                                  </button>
                                )}

                                {canDirectApprove && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      openConfirmAction({
                                        type: 'approve',
                                        title: 'Duyệt tin tuyển dụng này?',
                                        description:
                                          'Tin nháp do manager tạo sẽ được chuyển sang luồng duyệt và quét AI ngay sau khi xác nhận.',
                                        confirmLabel: 'Duyệt tin',
                                        confirmTone: 'emerald',
                                        onConfirm: () =>
                                          statusMutation.mutate(
                                            {
                                              jobId: job.id,
                                              action: 'approve',
                                              companyId: job.companyId,
                                            },
                                            {
                                              onSuccess: () =>
                                                toast.success('Đã duyệt tin tuyển dụng!'),
                                            }
                                          ),
                                      })
                                    }}
                                    disabled={statusMutation.isPending}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Duyệt tin
                                  </button>
                                )}

                                {canReview && (
                                  <div className="mt-1 border-t border-slate-100 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        closeMenu()
                                        openConfirmAction({
                                          type: 'approve',
                                          title: 'Duyệt tin tuyển dụng này?',
                                          description:
                                            'Hành động này sẽ chuyển tin sang luồng quét AI/hiển thị chính thức. Bạn có chắc chắn muốn tiếp tục không?',
                                          confirmLabel: 'Duyệt tin',
                                          confirmTone: 'emerald',
                                          onConfirm: () =>
                                            statusMutation.mutate(
                                              {
                                                jobId: job.id,
                                                action: 'approve',
                                                companyId: job.companyId,
                                              },
                                              {
                                                onSuccess: () =>
                                                  toast.success('Đã duyệt tin tuyển dụng!'),
                                              }
                                            ),
                                        })
                                      }}
                                      disabled={statusMutation.isPending}
                                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                      Duyệt tin
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        closeMenu()
                                        openRejectConfirmation(job)
                                      }}
                                      disabled={statusMutation.isPending}
                                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                                      Từ chối
                                    </button>
                                  </div>
                                )}

                                {canClose && (
                                  <button
                                    type="button"
                                    onClick={() => openCloseConfirmation(job)}
                                    disabled={statusMutation.isPending}
                                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Đóng tin tuyển dụng"
                                  >
                                    <CircleX className="h-4 w-4" />
                                    Đóng tin
                                  </button>
                                )}

                                {canDelete && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      closeMenu()
                                      openConfirmAction({
                                        type: 'delete',
                                        title: 'Xóa tin tuyển dụng bản nháp?',
                                        description:
                                          'Tin nháp sẽ bị xóa mềm và không còn xuất hiện trong danh sách quản lý. Hành động này không thể hoàn tác trực tiếp.',
                                        confirmLabel: 'Xóa tin',
                                        confirmTone: 'rose',
                                        onConfirm: () =>
                                          deleteJobMutation.mutate(
                                            { jobId: job.id, companyId: job.companyId },
                                            {
                                              onSuccess: () => {
                                                toast.success('Đã xóa tin tuyển dụng bản nháp!')
                                              },
                                            }
                                          ),
                                      })
                                    }}
                                    disabled={deleteJobMutation.isPending}
                                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <CircleX className="h-4 w-4" />
                                    Xóa
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
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

      {previewJob && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  Xem nội bộ
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{previewJob.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {previewJob.companyName || 'Chưa có tên công ty'} ·{' '}
                  {JOB_STATUS_LABELS[previewJob.status] || previewJob.status}
                </p>
              </div>

              <button
                type="button"
                onClick={closePreview}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng xem nội bộ"
              >
                <CircleX className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Địa điểm
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {previewJob.location || 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Hình thức
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {JOB_TYPE_LABELS[previewJob.jobType] || previewJob.jobType || 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Kinh nghiệm
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {EXPERIENCE_LEVEL_LABELS[previewJob.experienceLevel] ||
                      previewJob.experienceLevel}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Mức lương
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatSalary(previewJob.salaryMin, previewJob.salaryMax)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-6">
                  <section className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
                      Mô tả
                    </h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                      {previewJob.description || 'Chưa có mô tả'}
                    </p>
                  </section>

                  <section className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
                      Yêu cầu
                    </h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                      {previewJob.requirements || 'Chưa có yêu cầu'}
                    </p>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
                      Kỹ năng
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {previewJob.skills?.length ? (
                        previewJob.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                          >
                            {skill.skillName}
                            {skill.requiredLevel && (
                              <span className="text-blue-500">· {skill.requiredLevel}</span>
                            )}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">Chưa có kỹ năng</p>
                      )}
                    </div>
                  </section>

                  {previewJob.status === JobStatus.REJECTED && previewJob.rejectionReason && (
                    <section className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5">
                      <h3 className="text-sm font-black uppercase tracking-wide text-rose-700">
                        Lý do từ chối
                      </h3>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-rose-900">
                        {previewJob.rejectionReason}
                      </p>
                    </section>
                  )}

                  <section className="rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
                      Thông tin khác
                    </h3>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-semibold text-slate-500">Người tạo</span>
                        <span className="text-right font-medium text-slate-900">
                          {previewJob.createdByName || 'Chưa cập nhật'}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-semibold text-slate-500">Hạn nộp</span>
                        <span className="text-right font-medium text-slate-900">
                          {previewJob.deadline ? formatDate(previewJob.deadline) : 'Chưa cập nhật'}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-semibold text-slate-500">Ngày tạo</span>
                        <span className="text-right font-medium text-slate-900">
                          {previewJob.createdAt
                            ? formatDate(previewJob.createdAt)
                            : 'Chưa cập nhật'}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={closePreview}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {jobToReject && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <CircleX className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Từ chối tin tuyển dụng?</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Tin “{jobToReject.title}” sẽ chuyển sang trạng thái REJECTED và HR sẽ nhìn thấy lý
                  do này.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="reject-reason"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Lý do từ chối <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(event) => {
                  setRejectReason(event.target.value)
                  if (rejectReasonError) setRejectReasonError('')
                }}
                rows={5}
                placeholder="Ví dụ: Thiếu thông tin về phạm vi công việc, mô tả chưa rõ, hoặc chưa đúng chính sách công ty..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
              />
              {rejectReasonError && (
                <p className="mt-2 text-xs font-semibold text-rose-600">{rejectReasonError}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeRejectConfirmation}
                disabled={statusMutation.isPending}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmRejectJob}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {jobToClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <CircleX className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Đóng tin tuyển dụng?</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Tin “{jobToClose.title}” sẽ chuyển sang trạng thái CLOSED và ngừng nhận hồ sơ.
                </p>
              </div>
            </div>

            {deadlineHasNotEnded && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Cảnh báo: hạn tuyển dụng chưa kết thúc. Hạn hiện tại là{' '}
                {formatDate(jobToClose.deadline)}.
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setJobToClose(null)}
                disabled={statusMutation.isPending}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={closeJob}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Xác nhận đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-[61] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  confirmAction.confirmTone === 'blue'
                    ? 'bg-blue-100 text-blue-600'
                    : confirmAction.confirmTone === 'emerald'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-rose-100 text-rose-600'
                }`}
              >
                <CircleX className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{confirmAction.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {confirmAction.description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirmAction}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const handler = confirmAction.onConfirm
                  closeConfirmAction()
                  handler()
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors ${
                  confirmAction.confirmTone === 'blue'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : confirmAction.confirmTone === 'emerald'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
