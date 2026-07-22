'use client'

import React, { useState } from 'react'
import { X, Loader2, RefreshCw, Calendar, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { formatDateTime } from '@/src/utils'

const HOURLY_OPTIONS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
]

interface CandidateRescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (date: string, hour: string, reason: string) => void
  isLoading: boolean
  jobTitle: string
  currentInterviewTime?: string
  rescheduleCount?: number
  existingSlots?: any[]
}

export default function CandidateRescheduleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  jobTitle,
  currentInterviewTime,
  rescheduleCount = 0,
  existingSlots = [],
}: CandidateRescheduleModalProps) {
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredHour, setPreferredHour] = useState('09:00')
  const [reason, setReason] = useState('')

  const currentAttempt = rescheduleCount + 1
  const remainingCount = Math.max(0, 3 - rescheduleCount)

  if (!isOpen) return null

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!preferredDate) {
      toast.error('Vui lòng chọn ngày phỏng vấn mới!')
      return
    }

    const proposedTime = dayjs(`${preferredDate}T${preferredHour}:00`)
    if (!proposedTime.isValid() || proposedTime.valueOf() <= Date.now()) {
      toast.error('Thời gian phỏng vấn đề xuất phải ở thời điểm tương lai! Vui lòng chọn lại.')
      return
    }

    if (existingSlots && existingSlots.length > 0) {
      for (const slot of existingSlots) {
        if (slot.startTime) {
          const slotTime = dayjs(slot.startTime)
          const diffMinutes = Math.abs(proposedTime.diff(slotTime, 'minute'))
          if (diffMinutes < 30) {
            toast.error('Thời gian bạn đề xuất bị trùng (hoặc quá gần - dưới 30 phút) với một trong những khung giờ Nhà tuyển dụng đã gửi sẵn! Vui lòng chọn khung giờ đó trực tiếp thay vì đề xuất đổi lịch.')
            return
          }
        }
      }
    }

    onSubmit(preferredDate, preferredHour, reason)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-900">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                Đề xuất đổi lịch phỏng vấn
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-sm">
                Vị trí: {jobTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Đóng popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          {/* Attempt Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Số lần bạn xin đổi lịch:
            </span>
            <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
              Lần thứ {currentAttempt} / 3 (Còn lại {remainingCount} lần)
            </span>
          </div>
          {currentInterviewTime && (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 dark:bg-amber-950/30 p-4 space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Lịch phỏng vấn hiện tại
              </span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {formatDateTime(currentInterviewTime)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                1. Ngày phỏng vấn mới
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                2. Mốc giờ bắt đầu
              </label>
              <select
                value={preferredHour}
                onChange={(e) => setPreferredHour(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50 cursor-pointer"
              >
                {HOURLY_OPTIONS.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="schedule-change-reason" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Lý do bạn muốn đổi lịch
            </label>
            <textarea
              id="schedule-change-reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/50"
              placeholder="Nhập lý do chi tiết (ví dụ: bận lịch thi/trùng lịch công việc...)"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading || !preferredDate || !reason.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Xác nhận gửi đề xuất
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
