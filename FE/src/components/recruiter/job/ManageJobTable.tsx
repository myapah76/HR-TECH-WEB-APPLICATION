'use client'

import Link from 'next/link'
import { useState, useEffect, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  CircleX,
  Copy,
  Eye,
  MapPin,
  MoreHorizontal,
  Pencil,
  Send,
  ShieldAlert,
  Users,
  Calendar,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  useDeleteJobMutation,
  useUpdateJobStatusMutation,
  useDuplicateJobMutation,
} from '@/src/hooks/job'
import { CompanyMemberResponse } from '@/src/types/company'
import { RecruiterManageJobResponse } from '@/src/types/job'
import { formatDate } from '@/src/utils'
import { JobStatus, JOB_STATUS_LABELS, JOB_STATUS_STYLES } from '@/src/enums/job.enum'
import JobPreviewModal from '@/components/common/JobPreviewModal'
import JobRejectModal from '@/components/common/JobRejectModal'
import ConfirmModal from '@/components/common/ConfirmModal'

interface ManageJobTableProps {
  jobs: RecruiterManageJobResponse[]
  currentUserId?: string
  companyRole?: CompanyMemberResponse['role']
}

type ConfirmActionType = 'approve' | 'duplicate' | 'delete' | 'close' | 'appeal' | 'submit'

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
  const [jobToClose, setJobToClose] = useState<any | null>(null)
  const [jobToReject, setJobToReject] = useState<any | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectReasonError, setRejectReasonError] = useState('')
  const [previewJob, setPreviewJob] = useState<any | null>(null)
  const [openMenuJobId, setOpenMenuJobId] = useState<string | null>(null)
  const [openMenuDirection, setOpenMenuDirection] = useState<'up' | 'down'>('down')
  const [menuTriggerRect, setMenuTriggerRect] = useState<DOMRect | null>(null)
  const [deadlineHasNotEnded, setDeadlineHasNotEnded] = useState(false)

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
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(null)
  const deleteJobMutation = useDeleteJobMutation()
  const statusMutation = useUpdateJobStatusMutation()
  const duplicateJobMutation = useDuplicateJobMutation()

  const duplicateJob = (job: any) => {
    duplicateJobMutation.mutate(
      { jobId: job.id, companyId: job.companyId },
      {
        onSuccess: (newJob) => {
          toast.success('Đã tạo bản sao tin tuyển dụng ở trạng thái nháp!')
          router.push(`/recruiter/manage-jobs/${newJob.id}/update`)
        },
      }
    )
  }

  const submitJob = (job: any) => {
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

  const openCloseConfirmation = (job: any) => {
    setJobToClose(job)
    setDeadlineHasNotEnded(Boolean(job.deadline && new Date(job.deadline).getTime() > Date.now()))
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
        action: 'close',
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
    const rect = event.currentTarget.getBoundingClientRect()
    setMenuTriggerRect(rect)
    const menuHeight = 280
    const openUp = window.innerHeight - rect.bottom < menuHeight

    setOpenMenuDirection(openUp ? 'up' : 'down')
    setOpenMenuJobId((currentJobId) => (currentJobId === jobId ? null : jobId))
  }

  const closeMenu = () => {
    setOpenMenuJobId(null)
    setMenuTriggerRect(null)
  }

  const openInternalPreview = (job: any) => {
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
                <th className="px-4 py-4 text-center w-12">STT</th>
                <th className="px-6 py-4">Tin tuyển dụng</th>
                <th className="px-4 py-4">Địa điểm</th>
                <th className="px-4 py-4">Ngày tạo</th>
                <th className="px-4 py-4">Hạn nộp</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4 text-center">Đơn mới</th>
                <th className="px-4 py-4">Hồ sơ & Phỏng vấn</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job, index) => {
                const totalAppsCount = job.totalApplicationsCount ?? 0
                const newAppsCount = job.newApplicationsCount ?? 0
                const interviewsCount = job.interviewsCount ?? 0
                const canManageCandidates =
                  job.status === JobStatus.APPROVED || job.status === JobStatus.CLOSED

                return (
                  <tr key={job.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-5 text-center font-bold text-xs text-slate-400">
                      {index + 1}
                    </td>
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
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{job.createdAt ? formatDate(job.createdAt) : 'Chưa cập nhật'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      {job.deadline ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-700">{formatDate(job.deadline)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">
                          Vô thời hạn
                        </span>
                      )}
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
                    {/* Cột Đơn mới */}
                    <td className="px-4 py-5 text-center">
                      {newAppsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-black shadow-2xs">
                          {newAppsCount} đơn mới
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">0 đơn mới</span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      {canManageCandidates ? (
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/recruiter/manage-jobs/${job.id}/applications`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200/80"
                            title="Xem và quản lý hồ sơ ứng viên"
                          >
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            <span>Ứng viên ({totalAppsCount})</span>
                          </Link>
                          <Link
                            href={`/recruiter/manage-jobs/${job.id}/interviews`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors border border-emerald-200/80"
                            title="Quản lý lịch phỏng vấn"
                          >
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Phỏng vấn ({interviewsCount})</span>
                          </Link>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">
                          Chưa nhận đơn
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="relative flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(event) => toggleMenu(job.id, event)}
                          className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900"
                          aria-expanded={openMenuJobId === job.id}
                          aria-haspopup="menu"
                          title="Thao tác khác"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {previewJob && <JobPreviewModal job={previewJob} onClose={closePreview} />}

      {jobToReject && (
        <JobRejectModal
          job={jobToReject}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          rejectReasonError={rejectReasonError}
          setRejectReasonError={setRejectReasonError}
          onClose={closeRejectConfirmation}
          onConfirm={confirmRejectJob}
          isPending={statusMutation.isPending}
        />
      )}

      {jobToClose && (
        <ConfirmModal
          isOpen={true}
          title="Đóng tin tuyển dụng?"
          description={`Tin “${jobToClose.title}” sẽ chuyển sang trạng thái CLOSED (Đã đóng) và ẩn khỏi trang tìm kiếm công khai.
• Ngừng tiếp nhận đơn ứng tuyển mới từ Candidate.
• Tất cả đơn ứng tuyển ĐÃ NỘP trước đó vẫn được giữ nguyên để bạn tiếp tục Lọc AI và Phỏng vấn.${
            deadlineHasNotEnded && jobToClose.deadline
              ? ` Cảnh báo: Hạn tuyển dụng ban đầu vẫn còn đến ${formatDate(jobToClose.deadline)}.`
              : ''
          }`}
          confirmText="Xác nhận đóng tin"
          variant="danger"
          onClose={() => setJobToClose(null)}
          onConfirm={closeJob}
          isLoading={statusMutation.isPending}
        />
      )}

      {confirmAction && (
        <ConfirmModal
          isOpen={true}
          title={confirmAction.title}
          description={confirmAction.description}
          confirmText={confirmAction.confirmLabel}
          variant={
            confirmAction.confirmTone === 'rose'
              ? 'danger'
              : confirmAction.confirmTone === 'emerald'
                ? 'success'
                : 'info'
          }
          onClose={closeConfirmAction}
          onConfirm={() => {
            const handler = confirmAction.onConfirm
            closeConfirmAction()
            handler()
          }}
        />
      )}

      {(() => {
        const activeJob = jobs.find((j) => j.id === openMenuJobId)
        if (!activeJob || !menuTriggerRect || typeof document === 'undefined') return null

        const isJobCreator = activeJob.createdById?.toLowerCase() === currentUserId?.toLowerCase()
        const isManager = companyRole === 'HR_MANAGER'
        const isHr = companyRole === 'HR'

        const canSubmit =
          activeJob.status === JobStatus.DRAFT && (isJobCreator || isHr) && !isManager
        const canDirectApprove = activeJob.status === JobStatus.DRAFT && isJobCreator && isManager
        const canDelete = activeJob.status === JobStatus.DRAFT && (isJobCreator || isManager)
        const canEdit =
          activeJob.status === JobStatus.DRAFT ||
          activeJob.status === JobStatus.FAILED_AI ||
          activeJob.status === JobStatus.REJECTED_BY_ADMIN
        const canClose = activeJob.status === JobStatus.APPROVED && (isJobCreator || isManager)
        const canAppeal = activeJob.status === JobStatus.FAILED_AI && isManager
        const canOpenPublic =
          activeJob.status === JobStatus.APPROVED || activeJob.status === JobStatus.OPEN
        const viewTitle = canOpenPublic ? 'Xem tin công khai' : 'Xem nội bộ'

        return createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default bg-transparent w-full h-full border-0 outline-none"
              aria-label="Đóng menu thao tác"
              onClick={closeMenu}
            />
            <div
              className="fixed z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.35)] animate-in fade-in zoom-in-95 duration-100"
              style={{
                ...(openMenuDirection === 'down'
                  ? { top: `${menuTriggerRect.bottom + 8}px` }
                  : { bottom: `${window.innerHeight - menuTriggerRect.top + 8}px` }),
                left: `${menuTriggerRect.right - 224}px`,
              }}
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-bold text-slate-900">{activeJob.title}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {JOB_STATUS_LABELS[activeJob.status] || activeJob.status || 'Chưa xác định'}
                </p>
              </div>

              <div className="p-2">
                {canOpenPublic ? (
                  <Link
                    href={`/jobs/${activeJob.id}`}
                    aria-label={`${viewTitle} ${activeJob.title}`}
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
                    onClick={() => openInternalPreview(activeJob)}
                    aria-label={`${viewTitle} ${activeJob.title}`}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    title={viewTitle}
                  >
                    <Eye className="h-4 w-4" />
                    {viewTitle}
                  </button>
                )}

                {canEdit && (
                  <Link
                    href={`/recruiter/manage-jobs/${activeJob.id}/update`}
                    aria-label={`Chỉnh sửa ${activeJob.title}`}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
                    title={
                      activeJob.status === JobStatus.DRAFT
                        ? 'Chỉnh sửa tin'
                        : 'Chỉnh sửa và gửi lại'
                    }
                    onClick={closeMenu}
                  >
                    <Pencil className="h-4 w-4" />
                    {activeJob.status === JobStatus.DRAFT ? 'Chỉnh sửa' : 'Sửa và gửi lại'}
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
                      onConfirm: () => duplicateJob(activeJob),
                    })
                  }}
                  disabled={duplicateJobMutation.isPending}
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
                      openConfirmAction({
                        type: 'submit',
                        title: 'Nộp tin tuyển dụng này?',
                        description:
                          'Tin tuyển dụng sẽ được gửi lên cấp quản lý (HR Manager) để phê duyệt trước khi quét AI/hiển thị chính thức.',
                        confirmLabel: 'Nộp tin',
                        confirmTone: 'blue',
                        onConfirm: () => submitJob(activeJob),
                      })
                    }}
                    disabled={statusMutation.isPending}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Nộp tin
                  </button>
                )}

                {canAppeal && (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu()
                      openConfirmAction({
                        type: 'appeal',
                        title: 'Khiếu nại kiểm duyệt AI?',
                        description:
                          'Gửi yêu cầu khiếu nại lên Admin Hệ thống để phê duyệt thủ công tin tuyển dụng này. Bạn có chắc chắn muốn gửi khiếu nại không?',
                        confirmLabel: 'Gửi khiếu nại',
                        confirmTone: 'blue',
                        onConfirm: () =>
                          statusMutation.mutate(
                            {
                              jobId: activeJob.id,
                              action: 'appeal',
                              companyId: activeJob.companyId,
                            },
                            {
                              onSuccess: () =>
                                toast.success(
                                  'Đã gửi khiếu nại lên Admin Hệ thống thành công! Trạng thái tin đã chuyển thành "Đang khiếu nại".'
                                ),
                            }
                          ),
                      })
                    }}
                    disabled={statusMutation.isPending}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Khiếu nại AI
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
                              jobId: activeJob.id,
                              action: 'submit',
                              companyId: activeJob.companyId,
                            },
                            {
                              onSuccess: () =>
                                toast.success(
                                  'Đang thực hiện gửi duyệt. Hệ thống AI đang quét tin tuyển dụng trong nền...'
                                ),
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

                {canClose && (
                  <button
                    type="button"
                    onClick={() => openCloseConfirmation(activeJob)}
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
                            { jobId: activeJob.id, companyId: activeJob.companyId },
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
          </>,
          document.body
        )
      })()}
    </>
  )
}
