'use client'

import React from 'react'
import { AlertTriangle, Loader2, X, Trash2 } from 'lucide-react'

interface RejectSelectedModalProps {
  selectedCount: number
  thresholdPercent: number
  isLoading: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function RejectSelectedModal({
  selectedCount,
  thresholdPercent,
  isLoading,
  onConfirm,
  onClose,
}: RejectSelectedModalProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          </div>

          {/* Title */}
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 text-center mb-2">
            Xác nhận từ chối
          </h2>

          {/* Body */}
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center leading-relaxed mb-2">
            Bạn đang từ chối{' '}
            <span className="font-black text-rose-600">
              {selectedCount} đơn ứng tuyển
            </span>{' '}
            được chọn thủ công.
          </p>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 mb-5">
            <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
              Điểm sàn hiện tại:{' '}
              <span className="font-black">{thresholdPercent}%</span>. Ứng viên
              sẽ nhận thông báo từ chối. Hành động này không thể hoàn tác.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang từ chối...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Xác nhận từ chối {selectedCount} đơn
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
