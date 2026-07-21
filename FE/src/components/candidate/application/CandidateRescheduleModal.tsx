'use client'

import React, { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
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
}

export default function CandidateRescheduleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  jobTitle,
  currentInterviewTime,
}: CandidateRescheduleModalProps) {
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredHour, setPreferredHour] = useState('09:00')
  const [reason, setReason] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    onSubmit(preferredDate, preferredHour, reason)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Change schedule</h2>
            <p className="text-xs font-semibold text-slate-500">{jobTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-60 cursor-pointer"
            aria-label="Close change schedule popup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {currentInterviewTime && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-indigo-500">
                Current interview schedule
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-800">
                {formatDateTime(currentInterviewTime)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                1. Ngày phỏng vấn mong muốn
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                2. Mốc giờ phỏng vấn (Giờ tròn)
              </label>
              <select
                value={preferredHour}
                onChange={(e) => setPreferredHour(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100 cursor-pointer"
              >
                {HOURLY_OPTIONS.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="schedule-change-reason" className="block text-xs font-black uppercase tracking-wider text-slate-600">
              Reason
            </label>
            <textarea
              id="schedule-change-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
              placeholder="Nhập lý do bạn muốn đổi lịch phỏng vấn"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-black text-white shadow-xs transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm change
          </button>
        </div>
      </div>
    </div>
  )
}
