'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CircleX, Eye, Loader2, MapPin, Pencil, Send } from 'lucide-react'
import { toast } from 'sonner'

import { useUpdateJobStatusMutation } from '@/src/hooks/job'
import { CompanyMemberResponse } from '@/src/types/company'
import { Job } from '@/src/types/job'

interface ManageJobTableProps {
  jobs: Job[]
  currentUserId?: string
  companyRole?: CompanyMemberResponse['role']
}

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
}

const statusStyles: Record<string, string> = {
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING_APPROVAL: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
}

const statusLabels: Record<string, string> = {
  APPROVED: 'Đã duyệt',
  OPEN: 'Đang tuyển',
  CLOSED: 'Đã đóng',
  DRAFT: 'Bản nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  REJECTED: 'Bị từ chối',
}

export default function ManageJobTable({
  jobs,
  currentUserId,
  companyRole,
}: ManageJobTableProps) {
  const [jobToClose, setJobToClose] = useState<Job | null>(null)
  const [deadlineHasNotEnded, setDeadlineHasNotEnded] = useState(false)
  const statusMutation = useUpdateJobStatusMutation()

  const submitJob = (job: Job) => {
    statusMutation.mutate(
      { jobId: job.id, action: 'submit' },
      { onSuccess: () => toast.success('Đã nộp tin tuyển dụng để chờ phê duyệt!') }
    )
  }

  const closeJob = () => {
    if (!jobToClose) return

    statusMutation.mutate(
      { jobId: jobToClose.id, action: 'close' },
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
    setDeadlineHasNotEnded(
      Boolean(job.deadline && new Date(job.deadline).getTime() > Date.now())
    )
  }

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
              const isJobCreator =
                job.createdById?.toLowerCase() === currentUserId?.toLowerCase()
                const isManager = companyRole === 'HR_MANAGER'
                const isHr = companyRole === 'HR'
                const canSubmit = job.status === 'DRAFT' && (isJobCreator || isHr)
                const canEdit = job.status === 'DRAFT'
                const canClose = job.status !== 'CLOSED' && (isJobCreator || isManager)
                const canReview = job.status === 'PENDING_APPROVAL' && isManager
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
                  {jobTypeLabels[job.jobType] || job.jobType || 'Chưa cập nhật'}
                </td>
                <td className="px-4 py-5">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                      statusStyles[job.status] || statusStyles.CLOSED
                    }`}
                  >
                    {statusLabels[job.status] || job.status || 'Chưa xác định'}
                  </span>
                </td>
                <td className="px-4 py-5 text-sm font-medium text-slate-600">
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString('vi-VN')
                    : 'Chưa cập nhật'}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    {canSubmit && (
                      <button
                        type="button"
                        onClick={() => submitJob(job)}
                        disabled={statusMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                        Nộp
                      </button>
                    )}
                      {canReview && (
                          <>
                              <button
                                  type="button"
                                  onClick={() =>
                                      statusMutation.mutate(
                                          { jobId: job.id, action: 'approve' },
                                          { onSuccess: () => toast.success('Đã duyệt tin tuyển dụng!') }
                                      )
                                  }
                                  disabled={statusMutation.isPending}
                                  className="rounded-lg bg-emerald-50 px-2.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                              >
                                  APPROVE
                              </button>

                              <button
                                  type="button"
                                  onClick={() =>
                                      statusMutation.mutate(
                                          { jobId: job.id, action: 'reject' },
                                          { onSuccess: () => toast.success('Đã từ chối tin tuyển dụng!') }
                                      )
                                  }
                                  disabled={statusMutation.isPending}
                                  className="rounded-lg bg-red-50 px-2.5 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                              >
                                  REJECT
                              </button>
                          </>
                      )}
                      <Link
                          href={`/jobs/${job.id}`}
                          aria-label={`Xem ${job.title}`}
                          className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                          title="Xem tin"
                      >
                          <Eye className="h-4 w-4" />
                      </Link>
                    {canEdit ? (
                      <Link
                        href={`/recruiter/manage-jobs/${job.id}/update`}
                        aria-label={`Chỉnh sửa ${job.title}`}
                        className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50"
                        title="Chỉnh sửa tin"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        aria-label={`Không thể chỉnh sửa ${job.title}`}
                        className="rounded-lg p-2 text-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Tin đã duyệt không thể chỉnh sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openCloseConfirmation(job)}
                      disabled={!canClose || statusMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                      title={
                        job.status === 'CLOSED'
                          ? 'Tin đã đóng'
                          : canClose
                            ? 'Đóng tin tuyển dụng'
                            : 'Chỉ chủ tin hoặc HR Manager mới có thể đóng tin'
                      }
                    >
                      <CircleX className="h-4 w-4" />
                      Close
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
                {new Date(jobToClose.deadline).toLocaleDateString('vi-VN')}.
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
    </>
  )
}
