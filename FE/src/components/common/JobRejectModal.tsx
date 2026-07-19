'use client'

import { CircleX, Loader2 } from 'lucide-react'
import { Job } from '@/src/types/job'

interface JobRejectModalProps {
  job: Job
  rejectReason: string
  setRejectReason: (reason: string) => void
  rejectReasonError: string
  setRejectReasonError: (error: string) => void
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
  title?: string
  description?: string
  confirmLabel?: string
  placeholder?: string
}

export default function JobRejectModal({
  job,
  rejectReason,
  setRejectReason,
  rejectReasonError,
  setRejectReasonError,
  onClose,
  onConfirm,
  isPending,
  title = 'Từ chối tin tuyển dụng?',
  description,
  confirmLabel = 'Xác nhận từ chối',
  placeholder = 'Ví dụ: Thiếu thông tin về phạm vi công việc, mô tả chưa rõ, hoặc chưa đúng chính sách công ty...',
}: JobRejectModalProps) {
  const displayDescription =
    description ||
    `Tin “${job.title}” sẽ chuyển sang trạng thái REJECTED và HR sẽ nhìn thấy lý do này.`

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <CircleX className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {displayDescription}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="reject-reason"
            className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
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
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15 text-slate-800 dark:text-slate-100"
          />
          {rejectReasonError && (
            <p className="mt-2 text-xs font-semibold text-rose-600">{rejectReasonError}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
