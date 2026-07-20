'use client'

import { useState } from 'react'
import { ShieldAlert, X } from 'lucide-react'
import { Job } from '@/src/types/job'

interface JobAppealModalProps {
  job: Job
  isPending: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

export default function JobAppealModal({ job, isPending, onClose, onConfirm }: JobAppealModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const trimmed = reason.trim()
    if (!trimmed) {
      setError('Vui lòng nhập lý do khiếu nại.')
      return
    }
    if (trimmed.length < 10) {
      setError('Lý do khiếu nại phải có ít nhất 10 ký tự.')
      return
    }
    setError('')
    onConfirm(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950">
              <ShieldAlert className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Khiếu nại kiểm duyệt AI</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate max-w-72">
                {job.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 p-4 text-sm text-indigo-700 dark:text-indigo-300">
            <div>
              <p className="font-semibold">Khiếu nại sẽ được gửi lên Admin Hệ thống.</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                Mỗi tin tuyển dụng được khiếu nại tối đa 3 lần.
              </p>
            </div>
            <div className="shrink-0 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 rounded-lg text-xs font-bold text-indigo-800 dark:text-indigo-200">
              Đã dùng: {job.appealCount ?? 0}/3 lần
            </div>
          </div>

          {(job.appealCount ?? 0) >= 3 ? (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-semibold">
              Tin tuyển dụng này đã đạt giới hạn tối đa 3 lần khiếu nại. Vui lòng chỉnh sửa lại nội dung tin tuyển dụng trước khi nộp lại.
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Lý do khiếu nại <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 transition-all resize-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 ${
                  error
                    ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
                placeholder="Mô tả lý do bạn cho rằng tin tuyển dụng này hợp lệ và cần được Admin xem xét lại..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                  if (error) setError('')
                }}
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              <p className="text-xs text-slate-400 mt-1">{reason.trim().length} ký tự (tối thiểu 10)</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || (job.appealCount ?? 0) >= 3}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldAlert className="h-4 w-4" />
            {isPending ? 'Đang gửi...' : 'Gửi khiếu nại'}
          </button>
        </div>
      </div>
    </div>
  )
}
