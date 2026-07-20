'use client'

import Link from 'next/link'
import { useState, useEffect, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { CircleX, Copy, Eye, MapPin, MoreHorizontal, Pencil, Send, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

import {
  useCreateJobMutation,
  useDeleteJobMutation,
  useUpdateJobStatusMutation,
} from '@/src/hooks/job'
import { CompanyMemberResponse } from '@/src/types/company'
import { CreateJobRequest, Job } from '@/src/types/job'
import { formatDate } from '@/src/utils'
import {
  JobStatus,
  JOB_TYPE_LABELS,
  JOB_STATUS_LABELS,
  JOB_STATUS_STYLES,
} from '@/src/enums/job.enum'
import JobPreviewModal from '@/components/common/JobPreviewModal'
import JobAppealModal from '@/components/common/JobAppealModal'
import ConfirmModal from '@/components/common/ConfirmModal'

interface ManageJobTableProps {
  jobs: Job[]
  currentUserId?: string
  companyRole?: CompanyMemberResponse['role']
}

type ConfirmActionType = 'duplicate' | 'delete' | 'close' | 'submit'

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
  const [appealJob, setAppealJob] = useState<Job | null>(null)
  const [previewJob, setPreviewJob] = useState<Job | null>(null)
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
    salaryType: job.salaryType,
    jobType: job.jobType,
    experienceLevel: job.experienceLevel,
    deadline: job.deadline,
    requirements: job.requirements,
    benefits: job.benefits,
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
              {jobs.map((job) => (
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
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${JOB_STATUS_STYLES[job.status] || JOB_STATUS_STYLES[JobStatus.CLOSED]
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewJob && <JobPreviewModal job={previewJob} onClose={closePreview} />}

      {appealJob && (
        <JobAppealModal
          job={appealJob}
          isPending={statusMutation.isPending}
          onClose={() => setAppealJob(null)}
          onConfirm={(reason) =>
            statusMutation.mutate(
              { jobId: appealJob.id, action: 'appeal', companyId: appealJob.companyId, reason },
              {
                onSuccess: () => {
                  toast.success('Đã gửi khiếu nại lên Admin Hệ thống!')
                  setAppealJob(null)
                },
              }
            )
          }
        />
      )}

      {jobToClose && (
        <ConfirmModal
          isOpen={true}
          title="Đóng tin tuyển dụng?"
          description={`Tin “${jobToClose.title}” sẽ chuyển sang trạng thái CLOSED và ngừng nhận hồ sơ.${deadlineHasNotEnded && jobToClose.deadline
              ? ` Cảnh báo: hạn tuyển dụng chưa kết thúc. Hạn hiện tại là ${formatDate(jobToClose.deadline)}.`
              : ''
            }`}
          confirmText="Xác nhận đóng"
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

        const canSubmitToAI = activeJob.status === JobStatus.DRAFT
        const canDelete = activeJob.status === JobStatus.DRAFT && (isJobCreator || companyRole === 'HR_MANAGER')
        const canEdit =
          activeJob.status === JobStatus.DRAFT ||
          activeJob.status === JobStatus.FAILED_AI ||
          activeJob.status === JobStatus.REJECTED_BY_ADMIN
        const isManager = companyRole === 'HR_MANAGER' || companyRole === 'OWNER'
        const canClose = (activeJob.status === JobStatus.APPROVED || activeJob.status === JobStatus.OPEN) && isManager
        const canAppeal = activeJob.status === JobStatus.FAILED_AI
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
                  disabled={createJobMutation.isPending}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Tạo bản sao nháp"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>

                {canSubmitToAI && (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu()
                      openConfirmAction({
                        type: 'submit',
                        title: 'Gửi duyệt AI?',
                        description:
                          'Tin tuyển dụng sẽ được gửi thẳng vào hàng đợi quét AI để kiểm duyệt tự động. Sau khi AI duyệt, tin sẽ hiển thị công khai.',
                        confirmLabel: 'Gửi duyệt AI',
                        confirmTone: 'blue',
                        onConfirm: () => submitJob(activeJob),
                      })
                    }}
                    disabled={statusMutation.isPending}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Gửi duyệt AI
                  </button>
                )}

                {canAppeal && (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu()
                      setAppealJob(activeJob)
                    }}
                    disabled={statusMutation.isPending || (activeJob.appealCount ?? 0) >= 3}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Khiếu nại AI</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                      {activeJob.appealCount ?? 0}/3
                    </span>
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
