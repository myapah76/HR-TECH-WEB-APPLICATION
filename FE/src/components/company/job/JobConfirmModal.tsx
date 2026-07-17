'use client'

import { CircleX, Loader2 } from 'lucide-react'

interface JobConfirmModalProps {
  title: string
  description: string
  confirmLabel: string
  confirmTone: 'blue' | 'emerald' | 'rose'
  warningText?: string
  onClose: () => void
  onConfirm: () => void
  isPending?: boolean
}

export default function JobConfirmModal({
  title,
  description,
  confirmLabel,
  confirmTone,
  warningText,
  onClose,
  onConfirm,
  isPending,
}: JobConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[61] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              confirmTone === 'blue'
                ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                : confirmTone === 'emerald'
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
            }`}
          >
            <CircleX className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {warningText && (
          <div className="mt-5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm font-semibold text-amber-800 dark:text-amber-300">
            {warningText}
          </div>
        )}

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
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              confirmTone === 'blue'
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                : confirmTone === 'emerald'
                  ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                  : 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600'
            }`}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
