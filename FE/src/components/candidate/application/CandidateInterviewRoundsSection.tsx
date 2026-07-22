'use client'

import React from 'react'
import {
  CalendarCheck2,
  Clock,
  MapPin,
  Link as LinkIcon,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetApplicationInterviewRounds,
  useSelectInterviewSlot,
} from '@/src/hooks/application'
import { formatDateTime, getErrorMessage } from '@/src/utils'

interface CandidateInterviewRoundsSectionProps {
  applicationId: string
  jobTitle: string
  onOpenChangeSchedule: () => void
}

export default function CandidateInterviewRoundsSection({
  applicationId,
  jobTitle,
  onOpenChangeSchedule,
}: CandidateInterviewRoundsSectionProps) {
  const { data: rounds = [], isLoading } = useGetApplicationInterviewRounds(applicationId)
  const selectSlotMutation = useSelectInterviewSlot()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 gap-2 text-xs font-semibold text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        Đang tải thông tin lịch phỏng vấn...
      </div>
    )
  }

  if (!rounds || rounds.length === 0) {
    return null
  }

  const activeRound = rounds[rounds.length - 1]
  if (!activeRound) return null

  const handleSelectSlot = (slotId: string) => {
    selectSlotMutation.mutate(
      {
        applicationId,
        roundNumber: activeRound.roundNumber,
        slotId,
      },
      {
        onSuccess: () => {
          toast.success('Bạn đã chốt khung giờ phỏng vấn thành công!')
        },
        onError: (err) => {
          toast.error(getErrorMessage(err))
        },
      }
    )
  }

  const isSlotsSent = activeRound.status === 'SLOTS_SENT' || activeRound.status === 'RESCHEDULE_REJECTED'
  const isConfirmed = activeRound.status === 'CONFIRMED'
  const isRescheduleRequested = activeRound.status === 'RESCHEDULE_REQUESTED'

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarCheck2 className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Lịch phỏng vấn ({activeRound.roundName})
          </h4>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg">
          Vòng {activeRound.roundNumber} / {rounds.length}
        </span>
      </div>

      {/* Case 1: HR sent slots, Candidate needs to choose */}
      {isSlotsSent && (
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-3">
          <div>
            <p className="text-xs font-black text-blue-900 dark:text-blue-200">
              Nhà tuyển dụng đã gửi các khung giờ phỏng vấn cho bạn
            </p>
            <p className="text-[11px] font-semibold text-blue-700/80 dark:text-blue-300/80 mt-0.5">
              Vui lòng chọn 1 khung giờ phù hợp nhất bên dưới để chốt lịch phỏng vấn.
            </p>
          </div>

          {activeRound.slots && activeRound.slots.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {activeRound.slots.map((slot: any) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-blue-400 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        {formatDateTime(slot.startTime)} - {slot.endTime ? formatDateTime(slot.endTime).split(' ')[0] : ''}
                      </span>
                    </div>

                    {slot.location && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{slot.location}</span>
                      </div>
                    )}

                    {slot.meetingLink && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        <LinkIcon className="w-3 h-3 shrink-0" />
                        <a
                          href={slot.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline truncate max-w-xs"
                        >
                          Google Meet ({slot.meetingLink})
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectSlot(slot.id)}
                    disabled={selectSlotMutation.isPending}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs self-end sm:self-center shrink-0 flex items-center gap-1.5"
                  >
                    {selectSlotMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    Chọn khung giờ này
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Chưa có khung giờ chi tiết nào được đính kèm.</p>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onOpenChangeSchedule}
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Không có khung giờ nào phù hợp? Đề xuất đổi lịch khác
            </button>
          </div>
        </div>
      )}

      {/* Case 2: Confirmed Interview Schedule */}
      {isConfirmed && (
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Lịch phỏng vấn đã chốt thành công
            </span>
            <button
              type="button"
              onClick={onOpenChangeSchedule}
              className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Xin đổi lịch
            </button>
          </div>

          <div className="space-y-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Thời gian: {formatDateTime(activeRound.scheduledTime)}
            </p>
            {activeRound.location && (
              <p className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400" />
                Địa điểm: {activeRound.location}
              </p>
            )}
            {activeRound.meetingLink && (
              <p className="flex items-center gap-2 font-semibold text-blue-600">
                <LinkIcon className="w-4 h-4" />
                Link Online:{' '}
                <a href={activeRound.meetingLink} target="_blank" rel="noreferrer" className="underline">
                  {activeRound.meetingLink}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Case 3: Candidate requested reschedule */}
      {isRescheduleRequested && (
        <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-900/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-cyan-800 dark:text-cyan-300">
            <RefreshCw className="w-4 h-4 text-cyan-600" />
            Bạn đã gửi đề xuất đổi lịch phỏng vấn
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Thời gian đề xuất: <span className="font-bold">{formatDateTime(activeRound.candidatePreferredTime)}</span>
          </p>
          {activeRound.candidateRescheduleReason && (
            <p className="text-xs text-slate-500 italic">
              Lý do: &quot;{activeRound.candidateRescheduleReason}&quot;
            </p>
          )}
          <p className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400">
            Vui lòng kiên nhẫn chờ Nhà tuyển dụng xem xét và phản hồi.
          </p>
        </div>
      )}
    </div>
  )
}
