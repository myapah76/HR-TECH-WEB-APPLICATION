'use client'

import React, { useState, useEffect } from 'react'
import {
  CalendarCheck2,
  Clock,
  MapPin,
  Link as LinkIcon,
  CheckCircle2,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Sparkles,
  Award,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useGetApplicationInterviewRounds, useSelectInterviewSlot } from '@/src/hooks/application'
import { formatDateTime, getErrorMessage } from '@/src/utils'

interface CandidateInterviewRoundsSectionProps {
  applicationId: string
  jobTitle: string
  applicationStatus?: string
  enabled?: boolean
  onOpenChangeSchedule: (roundNumber: number) => void
}

function formatSlotTimeRange(startTimeIso: string, endTimeIso?: string) {
  try {
    const start = new Date(startTimeIso)
    const dateStr = start.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const startHourStr = start.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    if (!endTimeIso) {
      return `${startHourStr} (${dateStr})`
    }
    const end = new Date(endTimeIso)
    const endHourStr = end.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / (60 * 1000))
    const durationStr = diffMinutes > 0 ? ` • Thời lượng: ${diffMinutes} phút` : ''
    return `${startHourStr} - ${endHourStr} (${dateStr})${durationStr}`
  } catch {
    return startTimeIso
  }
}

export default function CandidateInterviewRoundsSection({
  applicationId,
  jobTitle,
  applicationStatus,
  enabled = true,
  onOpenChangeSchedule,
}: CandidateInterviewRoundsSectionProps) {
  const { data: rounds = [], isLoading } = useGetApplicationInterviewRounds(applicationId, enabled)
  const selectSlotMutation = useSelectInterviewSlot()

  // State to track which round tab candidate is currently viewing (default to latest active round)
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(0)

  useEffect(() => {
    if (rounds && rounds.length > 0) {
      setSelectedRoundIndex(rounds.length - 1)
    }
  }, [rounds?.length])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 gap-2 text-xs font-semibold text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        Đang tải thông tin quy trình phỏng vấn...
      </div>
    )
  }

  if (!rounds || rounds.length === 0) {
    return null
  }

  const currentViewRound = rounds[selectedRoundIndex] || rounds[rounds.length - 1]
  const latestRoundIndex = rounds.length - 1

  const handleSelectSlot = (slotId: string) => {
    selectSlotMutation.mutate(
      {
        applicationId,
        roundNumber: currentViewRound.roundNumber,
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

  const isSlotsSent =
    currentViewRound.status === 'SLOTS_SENT' || currentViewRound.status === 'RESCHEDULE_REJECTED'
  const isConfirmed = currentViewRound.status === 'CONFIRMED'
  const isRescheduleRequested = currentViewRound.status === 'RESCHEDULE_REQUESTED'
  const isAttended = currentViewRound.status === 'ATTENDED'
  const isPassed =
    currentViewRound.status === 'PASSED' || currentViewRound.status === 'INTERVIEW_COMPLETED'
  const isFailed = currentViewRound.status === 'FAILED' || currentViewRound.status === 'TERMINATED'
  const isNotStarted = currentViewRound.status === 'NOT_STARTED'
  const isFinalAccepted = applicationStatus === 'ACCEPTED'

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
      {/* Banner Chúc Mừng Trúng Tuyển (ACCEPTED) */}
      {isFinalAccepted && (
        <div className="p-4.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/20 space-y-2 border border-emerald-400/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 font-black shadow-xs">
              🎉
            </div>
            <h4 className="font-black text-sm uppercase tracking-wide text-amber-300">
              Chúc Mừng! Bạn Đã Xuất Sắc Trúng Tuyển Chính Thức!
            </h4>
          </div>
          <p className="text-xs font-medium text-emerald-50 leading-relaxed pl-10">
            Hồ sơ ứng tuyển và sự thể hiện qua các vòng phỏng vấn của bạn cho vị trí <strong>{jobTitle}</strong> đã được Nhà tuyển dụng phê duyệt thành công. Bộ phận Nhân sự (HR) sẽ sớm liên hệ gửi Thư mời nhận việc (Job Offer) và trao đổi chi tiết đến bạn!
          </p>
        </div>
      )}

      {/* ── 1. Visual Round Stepper / Tabs Bar ── */}
      {/* ── 1. Visual Round Stepper / Tabs Bar ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-4.5 h-4.5 text-blue-600" />
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Tiến Trình Phỏng Vấn ({rounds.length} Vòng)
            </h4>
          </div>
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-800">
            Đang xem Vòng {currentViewRound.roundNumber} / {rounds.length}
          </span>
        </div>

        {/* Round Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {rounds.map((r, idx) => {
            const isCurrentActive = idx === latestRoundIndex
            const isSelectedTab = idx === selectedRoundIndex
            const rPassed = r.status === 'PASSED' || r.status === 'INTERVIEW_COMPLETED'
            const rFailed = r.status === 'FAILED' || r.status === 'TERMINATED'

            return (
              <button
                key={r.id || idx}
                type="button"
                onClick={() => setSelectedRoundIndex(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-2xs border ${
                  isSelectedTab
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/30'
                    : rPassed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                      : rFailed
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{r.roundName || `Vòng ${r.roundNumber}`}</span>
                {rPassed ? (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${isSelectedTab ? 'text-white' : 'text-emerald-500'}`}
                  />
                ) : rFailed ? (
                  <XCircle
                    className={`w-3.5 h-3.5 ${isSelectedTab ? 'text-white' : 'text-rose-500'}`}
                  />
                ) : isCurrentActive ? (
                  <span
                    className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"
                    title="Vòng hiện tại"
                  />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 2. Round Details Container for currentViewRound ── */}

      {/* Case A: PASSED / COMPLETED ROUND */}
      {isPassed && (
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-black text-emerald-800 dark:text-emerald-200">
              <Award className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              ĐÃ VƯỢT QUA VÒNG {currentViewRound.roundNumber} ({currentViewRound.roundName})
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 rounded-full">
              ĐÃ ĐẠT
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
            {currentViewRound.scheduledTime && (
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Thời gian phỏng vấn:{' '}
                  <strong>{formatDateTime(currentViewRound.scheduledTime)}</strong>
                </span>
              </p>
            )}
            {currentViewRound.location && (
              <p className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400" />
                Địa điểm: {currentViewRound.location}
              </p>
            )}
            {currentViewRound.meetingLink && (
              <p className="flex items-center gap-2 font-semibold text-blue-600">
                <LinkIcon className="w-4 h-4" />
                Link Online:{' '}
                <a
                  href={currentViewRound.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {currentViewRound.meetingLink}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Case B: SLOTS SENT (Needs candidate action) */}
      {isSlotsSent && (
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-3">
          <div>
            <p className="text-xs font-black text-blue-900 dark:text-blue-200">
              Nhà tuyển dụng đã gửi các khung giờ phỏng vấn cho Vòng {currentViewRound.roundNumber}
            </p>
            <p className="text-[11px] font-semibold text-blue-700/80 dark:text-blue-300/80 mt-0.5">
              Vui lòng chọn 1 khung giờ phù hợp nhất bên dưới để chốt lịch phỏng vấn.
            </p>
          </div>

          {currentViewRound.hrRejectionReason && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-extrabold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Phản hồi từ Nhà tuyển dụng về yêu cầu xin đổi lịch của bạn:
              </span>
              <p className="italic font-medium pl-5 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/60">
                &quot;{currentViewRound.hrRejectionReason}&quot;
              </p>
            </div>
          )}

          {currentViewRound.slots && currentViewRound.slots.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {(() => {
                const sortedSlots = [...currentViewRound.slots].sort((a: any, b: any) => {
                  if (a.isNewSlot && !b.isNewSlot) return -1
                  if (!a.isNewSlot && b.isNewSlot) return 1
                  return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                })

                return sortedSlots.map((slot: any, idx: number) => {
                  const isExtendedSlot = Boolean(slot.isNewSlot)

                  return (
                    <div
                      key={slot.id || idx}
                      className={`p-3.5 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                        isExtendedSlot
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-400 dark:border-emerald-600 hover:border-emerald-500'
                          : 'bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-800 hover:border-blue-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-100">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{formatSlotTimeRange(slot.startTime, slot.endTime)}</span>
                          {isExtendedSlot && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Slot mới HR bổ sung
                            </span>
                          )}
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
                        className={`px-4 py-2 text-xs font-bold text-white disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs self-end sm:self-center shrink-0 flex items-center gap-1.5 ${
                          isExtendedSlot
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {selectSlotMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Chọn khung giờ này
                      </button>
                    </div>
                  )
                })
              })()}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Chưa có khung giờ chi tiết nào được đính kèm.
            </p>
          )}

          {(() => {
            const usedReschedules = currentViewRound.rescheduleCount || 0
            const remainingReschedules = Math.max(0, 3 - usedReschedules)

            return (
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-blue-100 dark:border-blue-900/40">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-xl border border-amber-200/60 dark:border-amber-900/60">
                  Số lần xin đổi lịch còn lại: <strong>{remainingReschedules} / 3 lần</strong>
                </span>
                {remainingReschedules > 0 ? (
                  <button
                    type="button"
                    onClick={() => onOpenChangeSchedule(currentViewRound.roundNumber)}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Không có khung giờ nào phù hợp? Đề xuất đổi lịch khác
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-rose-600 italic">
                    (Đã hết số lần xin đổi lịch cho vòng này)
                  </span>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* Case C: CONFIRMED SCHEDULE */}
      {isConfirmed && (
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Lịch phỏng vấn Vòng {currentViewRound.roundNumber} đã chốt thành công
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            {(() => {
              const selectedSlot = currentViewRound.slots?.find((s: any) => s.isSelected)
              const durationMins =
                selectedSlot?.startTime && selectedSlot?.endTime
                  ? Math.round(
                      (new Date(selectedSlot.endTime).getTime() -
                        new Date(selectedSlot.startTime).getTime()) /
                        (60 * 1000)
                    )
                  : 0

              return (
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Thời gian:{' '}
                    <strong className="text-emerald-900 dark:text-emerald-100">
                      {formatDateTime(currentViewRound.scheduledTime)}
                    </strong>
                    {durationMins > 0 && (
                      <span className="text-emerald-700 dark:text-emerald-300 font-semibold ml-1.5">
                        (Thời lượng: {durationMins} phút)
                      </span>
                    )}
                  </span>
                </p>
              )
            })()}
            {currentViewRound.location && (
              <p className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400" />
                Địa điểm: {currentViewRound.location}
              </p>
            )}
            {currentViewRound.meetingLink && (
              <p className="flex items-center gap-2 font-semibold text-blue-600">
                <LinkIcon className="w-4 h-4" />
                Link Online:{' '}
                <a
                  href={currentViewRound.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {currentViewRound.meetingLink}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Case D: ATTENDED (Waiting evaluation) */}
      {isAttended && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-indigo-800 dark:text-indigo-300">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            Đã hoàn thành điểm danh phỏng vấn Vòng {currentViewRound.roundNumber}
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Cảm ơn bạn đã tham gia phỏng vấn! Đang chờ kết quả đánh giá từ Nhà tuyển dụng.
          </p>
        </div>
      )}

      {/* Case E: CANDIDATE RESCHEDULE REQUESTED */}
      {isRescheduleRequested && (
        <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-900/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-cyan-800 dark:text-cyan-300">
            <RefreshCw className="w-4 h-4 text-cyan-600" />
            Bạn đã gửi đề xuất đổi lịch phỏng vấn Vòng {currentViewRound.roundNumber}
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Thời gian đề xuất:{' '}
            <span className="font-bold">
              {formatDateTime(currentViewRound.candidatePreferredTime)}
            </span>
          </p>
          {currentViewRound.candidateRescheduleReason && (
            <p className="text-xs text-slate-500 italic">
              Lý do: &quot;{currentViewRound.candidateRescheduleReason}&quot;
            </p>
          )}
          <p className="text-[11px] font-bold text-cyan-700 dark:text-cyan-400">
            Vui lòng kiên nhẫn chờ Nhà tuyển dụng xem xét và phản hồi.
          </p>
        </div>
      )}

      {/* Case F: NOT STARTED */}
      {isNotStarted && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-slate-400" />
            Vòng {currentViewRound.roundNumber} ({currentViewRound.roundName}): Chưa mở xếp lịch
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Nhà tuyển dụng sẽ sớm gửi danh sách khung giờ phỏng vấn cho bạn ở Vòng này.
          </p>
        </div>
      )}

      {/* Case G: FAILED / TERMINATED */}
      {isFailed && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-rose-800 dark:text-rose-200">
            <XCircle className="w-4 h-4 text-rose-600" />
            Kết quả Vòng {currentViewRound.roundNumber}: Chưa phù hợp
          </div>
          <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
            Cảm ơn bạn đã quan tâm và tham gia ứng tuyển vị trí này.
          </p>
        </div>
      )}
    </div>
  )
}
