'use client'

import React, { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { InterviewRoundDetail } from '@/src/types/recruiter-interview'

interface NoShowFailModalProps {
  candidate: InterviewRoundDetail | null
  activeRound: number
  isLoading?: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

export default function NoShowFailModal({
  candidate,
  activeRound,
  isLoading = false,
  onClose,
  onConfirm,
}: NoShowFailModalProps) {
  const [reason, setReason] = useState('Ứng viên không tham dự phỏng vấn (Vắng mặt / No-show)')
  const [reasonError, setReasonError] = useState('')

  if (!candidate) return null

  const handleConfirm = () => {
    if (!reason.trim()) {
      setReasonError('Lý do vắng mặt / không tham dự không được để trống!')
      return
    }
    setReasonError('')
    onConfirm(reason.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-4">
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-2xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Xác Nhận Đánh Vắng Mặt &amp; Loại Ứng Viên
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {candidate.candidateName} - Vòng {activeRound}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Lý do vắng mặt / không tham dự phỏng vấn <span className="text-rose-600">*</span>:
          </label>
          <textarea
            rows={3}
            required
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (e.target.value.trim()) setReasonError('')
            }}
            placeholder="Nhập chi tiết lý do vắng mặt..."
            className={`w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none transition-colors ${
              reasonError ? 'border-rose-500 focus:border-rose-600' : 'border-slate-200 dark:border-slate-700 focus:border-rose-500'
            }`}
          />
          {reasonError && <p className="text-xs font-bold text-rose-600 mt-1">{reasonError}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Đang xử lý...' : 'Xác Nhận Đánh Fail (Loại)'}
          </button>
        </div>
      </div>
    </div>
  )
}
