'use client'

import { type FormEvent } from 'react'
import { X, CheckCircle2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  acceptedStartDateTime: string
  acceptedWorkAddress: string
  acceptedNote: string
  onStartDateTimeChange: (v: string) => void
  onWorkAddressChange: (v: string) => void
  onNoteChange: (v: string) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export default function OfferModal({
  isOpen,
  acceptedStartDateTime,
  acceptedWorkAddress,
  acceptedNote,
  onStartDateTimeChange,
  onWorkAddressChange,
  onNoteChange,
  onSubmit,
  onClose,
}: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900">Thông tin nhận việc</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <label className="block">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Thời gian nhận việc / báo cáo
            </span>
            <input
              id="accepted-start-date-time"
              type="datetime-local"
              required
              value={acceptedStartDateTime}
              onChange={(e) => onStartDateTimeChange(e.target.value)}
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Địa điểm làm việc / báo cáo
            </span>
            <textarea
              id="accepted-work-address"
              required
              value={acceptedWorkAddress}
              onChange={(e) => onWorkAddressChange(e.target.value)}
              rows={3}
              placeholder="VD: Văn phòng công ty, tầng 5"
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Ghi chú
            </span>
            <textarea
              id="accepted-note"
              value={acceptedNote}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={3}
              placeholder="Thông tin cần chuẩn bị, người liên hệ..."
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!acceptedStartDateTime || !acceptedWorkAddress.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Xác nhận và gửi email
          </button>
        </div>
      </form>
    </div>
  )
}
