'use client'

import React from 'react'
import { X, Calendar, Clock, MapPin, Link as LinkIcon, CheckCircle2, Loader2, RefreshCw, AlertCircle, History } from 'lucide-react'
import { useGetApplicationInterviewRounds } from '@/src/hooks/application'
import { formatDateTime } from '@/src/utils'

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
  const rescheduleCount = roundData?.rescheduleCount || 0
  const candidatePreferredTime = roundData?.candidatePreferredTime
  const candidateRescheduleReason = roundData?.candidateRescheduleReason
  const scheduledTime = roundData?.scheduledTime

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-teal-50/50 dark:bg-teal-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-2xl border border-teal-200 dark:border-teal-800">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Lịch Sử Thương Lượng &amp; Chi Tiết Lịch Phỏng Vấn
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

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Đang tải lịch sử phỏng vấn...</span>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Attempt Count Badge Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                  Số lần xin đổi lịch đã thực hiện:
                </span>
                <span
                  className={`px-3 py-1 text-xs font-black rounded-full border ${
                    rescheduleCount >= 3
                      ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                      : rescheduleCount > 0
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  {rescheduleCount > 0 ? `Đã xin đổi ${rescheduleCount} / 3 lần` : 'Chưa đổi lịch (Lần ban đầu)'}
                </span>
              </div>

              {/* Confirmed Official Time */}
              {scheduledTime && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Lịch phỏng vấn chính thức đã chốt:
                  </span>
                  <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-100 pl-5">
                    {formatDateTime(scheduledTime)}
                  </p>
                </div>
              )}

              {/* Candidate Preferred Time Request (if candidate submitted a request) */}
              {candidatePreferredTime && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Đề xuất đổi lịch từ Ứng viên (Lần {rescheduleCount}/3):
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 pl-5 space-y-1">
                    <p>
                      Thời gian đề xuất: <strong className="text-amber-700 dark:text-amber-400">{formatDateTime(candidatePreferredTime)}</strong>
                    </p>
                    {candidateRescheduleReason && (
                      <p className="text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/60 mt-1">
                        &quot;{candidateRescheduleReason}&quot;
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Slots List Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Tất cả khung giờ HR đã gửi ({slots.length} slots):
                  </span>
                </div>

                {slots.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    Chưa có khung giờ nào được ghi nhận trong hệ thống.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {slots.map((slot: any, idx: number) => (
                      <div
                        key={slot.id || idx}
                        className={`p-4 rounded-2xl border space-y-2 transition-all ${
                          slot.isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 shadow-2xs'
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
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Ứng viên đã chọn
                            </span>
                          )}
                        </div>
                        <div className="pl-8 flex flex-wrap gap-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            <Clock className="w-3 h-3 text-teal-600" />
                            {formatHour(slot.startTime)} → {formatHour(slot.endTime)}
                          </span>
                          {slot.location && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
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
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
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
