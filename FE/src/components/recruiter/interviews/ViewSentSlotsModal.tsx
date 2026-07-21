'use client'

import React from 'react'
import { X, Calendar, Clock, MapPin, Link as LinkIcon, CheckCircle2, Loader2 } from 'lucide-react'
import { useGetApplicationInterviewRounds } from '@/src/hooks/application'

interface ViewSentSlotsModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string
  candidateName: string
  roundName: string
  roundNumber: number
}

function formatSlotTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function formatHour(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch {
    return iso
  }
}

export default function ViewSentSlotsModal({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  roundName,
  roundNumber,
}: ViewSentSlotsModalProps) {
  const { data: rounds = [], isLoading } = useGetApplicationInterviewRounds(
    isOpen ? applicationId : ''
  )

  if (!isOpen) return null

  // Find the round matching the current roundNumber
  const roundData = rounds.find((r: any) => r.roundNumber === roundNumber) || rounds[0]
  const slots: any[] = roundData?.slots || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-teal-50/50 dark:bg-teal-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-2xl border border-teal-200 dark:border-teal-800">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Lịch Phỏng Vấn Đã Gửi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {roundName} • Ứng viên: <strong>{candidateName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Đang tải danh sách lịch...</span>
            </div>
          )}

          {/* Status Banner */}
          {!isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
              <Clock className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                Đã gửi {slots.length} khung giờ cho ứng viên — Đang chờ ứng viên chọn
              </span>
            </div>
          )}

          {/* Slots List */}
          {!isLoading && slots.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Không có khung giờ nào được ghi nhận trong DB.
            </div>
          )}

          {!isLoading && slots.length > 0 && (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {slots.map((slot: any, idx: number) => (
                <div
                  key={slot.id || idx}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    slot.isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-[11px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      {formatSlotTime(slot.startTime)}
                    </span>
                    {slot.isSelected && (
                      <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Ứng viên đã chọn
                      </span>
                    )}
                  </div>
                  <div className="pl-8 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatHour(slot.startTime)} → {formatHour(slot.endTime)}
                    </span>
                    {slot.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {slot.location}
                      </span>
                    )}
                    {slot.meetingLink && (
                      <a
                        href={slot.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Google Meet
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
