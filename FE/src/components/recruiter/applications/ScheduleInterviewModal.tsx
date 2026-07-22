'use client'

import { type FormEvent } from 'react'
import { X, Loader2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  isSubmitting: boolean
  interviewDateTime: string
  interviewLocation: string
  interviewMeetingLink: string
  interviewNote: string
  onDateTimeChange: (v: string) => void
  onLocationChange: (v: string) => void
  onMeetingLinkChange: (v: string) => void
  onNoteChange: (v: string) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export default function ScheduleInterviewModal({
  isOpen,
  isSubmitting,
  interviewDateTime,
  interviewLocation,
  interviewMeetingLink,
  interviewNote,
  onDateTimeChange,
  onLocationChange,
  onMeetingLinkChange,
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
          <h3 className="text-base font-black text-slate-900">Lên lịch phỏng vấn</h3>
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
              Thời gian phỏng vấn
            </span>
            <input
              id="interview-date-time"
              type="datetime-local"
              required
              value={interviewDateTime}
              onChange={(e) => onDateTimeChange(e.target.value)}
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Địa điểm
            </span>
            <input
              id="interview-location"
              type="text"
              value={interviewLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="VD: Văn phòng công ty, tầng 5"
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Meeting link
            </span>
            <input
              id="interview-meeting-link"
              type="url"
              value={interviewMeetingLink}
              onChange={(e) => onMeetingLinkChange(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Ghi chú
            </span>
            <textarea
              id="interview-note"
              value={interviewNote}
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
            disabled={
              isSubmitting ||
              !interviewDateTime ||
              (!interviewLocation.trim() && !interviewMeetingLink.trim())
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Gửi lịch phỏng vấn
          </button>
        </div>
      </form>
    </div>
  )
}
