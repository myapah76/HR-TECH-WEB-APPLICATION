'use client'

import React, { useMemo, useState } from 'react'
import { CheckCircle2, Clock, AlertTriangle, MessageSquare, ArrowRight, User, Calendar, Check, X, ShieldAlert, Star, Users } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { InterviewRoundConfig, InterviewRoundDetail } from '@/src/types/recruiter-interview'
import { toast } from 'sonner'

interface MultiRoundInterviewStepperProps {
  roundsConfig: InterviewRoundConfig[]
  activeRound: number
  onSelectRound: (roundNumber: number) => void
  candidatesInRound: InterviewRoundDetail[]
  onOpenScheduler: (roundNumber: number, candidateIds: string[]) => void
  onPassCandidate: (applicationId: string, roundNumber: number, feedback: string, rating: number) => void
  onFailCandidate: (applicationId: string, roundNumber: number, feedback: string) => void
}

export default function MultiRoundInterviewStepper({
  roundsConfig,
  activeRound,
  onSelectRound,
  candidatesInRound,
  onOpenScheduler,
  onPassCandidate,
  onFailCandidate,
}: MultiRoundInterviewStepperProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [evaluatingCandidate, setEvaluatingCandidate] = useState<InterviewRoundDetail | null>(null)
  const [feedbackNote, setFeedbackNote] = useState('')
  const [rating, setRating] = useState(4)

  const handleToggleSelect = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const currentRoundInfo = roundsConfig.find((r) => r.roundNumber === activeRound) || {
    roundNumber: activeRound,
    roundName: `Vòng ${activeRound}`,
  }

  const handleOpenEvaluationModal = (cand: InterviewRoundDetail) => {
    setEvaluatingCandidate(cand)
    setFeedbackNote(cand.feedbackNote || '')
    setRating(cand.rating || 4)
  }

  const handlePass = () => {
    if (!evaluatingCandidate) return
    onPassCandidate(evaluatingCandidate.applicationId, activeRound, feedbackNote, rating)
    setEvaluatingCandidate(null)
  }

  const handleFail = () => {
    if (!evaluatingCandidate) return
    onFailCandidate(evaluatingCandidate.applicationId, activeRound, feedbackNote)
    setEvaluatingCandidate(null)
  }

  // ─── Phân loại Lịch Chưa Xác Nhận & Đã Xác Nhận (Group theo giờ) ───────────
  const unconfirmedCandidates = useMemo(
    () =>
      candidatesInRound.filter(
        (c) =>
          c.status !== 'CONFIRMED' ||
          !c.scheduledTime ||
          c.scheduledTime.includes('Chờ')
      ),
    [candidatesInRound]
  )

  const confirmedCandidates = useMemo(
    () =>
      candidatesInRound.filter(
        (c) =>
          c.status === 'CONFIRMED' &&
          c.scheduledTime &&
          !c.scheduledTime.includes('Chờ')
      ),
    [candidatesInRound]
  )

  // Các ứng viên CHƯA CÓ LỊCH (NOT_STARTED) - Cho phép tích chọn để Tạo lịch phỏng vấn hàng loạt
  const schedulableCandidates = useMemo(
    () =>
      unconfirmedCandidates.filter(
        (c) => c.status === 'NOT_STARTED' || !c.scheduledTime || c.scheduledTime.includes('Chưa')
      ),
    [unconfirmedCandidates]
  )

  // ─── Nhóm Lịch ĐÃ XÁC NHẬN: Cấp 1 theo NGÀY -> Cấp 2 theo GIỜ (Gộp chung ô nếu cùng giờ)
  const confirmedDateAndSlotGroups = useMemo(() => {
    const dateGroups: Record<string, Record<string, InterviewRoundDetail[]>> = {}

    confirmedCandidates.forEach((cand) => {
      const parts = (cand.scheduledTime || '').split(' ')
      const datePart = parts[0] || 'Chưa rõ ngày'
      const timePart = parts[1] || parts[0] || '09:00'

      if (!dateGroups[datePart]) dateGroups[datePart] = {}
      if (!dateGroups[datePart][timePart]) dateGroups[datePart][timePart] = []
      dateGroups[datePart][timePart].push(cand)
    })

    return Object.entries(dateGroups).map(([dateStr, timeObj]) => {
      const sortedTimeSlots = Object.entries(timeObj).sort(([t1], [t2]) => t1.localeCompare(t2))
      return {
        dateStr,
        totalCandidates: Object.values(timeObj).flat().length,
        timeSlots: sortedTimeSlots,
      }
    })
  }, [confirmedCandidates])

  return (
    <div className="space-y-8">
      {/* 1. Round Stepper Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto gap-4 pb-2 sm:pb-0">
          {roundsConfig.map((round) => {
            const isActive = round.roundNumber === activeRound
            return (
              <button
                key={round.roundNumber}
                type="button"
                onClick={() => onSelectRound(round.roundNumber)}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                    isActive
                      ? 'bg-white text-indigo-600'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {round.roundNumber}
                </div>
                <div className="text-left">
                  <p className="font-bold text-xs leading-tight">{round.roundName}</p>
                  <p className="text-[10px] opacity-80 font-medium">
                    {round.description || 'Tiêu chí đánh giá'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Round Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Danh sách Phỏng vấn - {currentRoundInfo.roundName}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tổng số {candidatesInRound.length} ứng viên ở vòng này • {confirmedCandidates.length} đã chốt lịch • {schedulableCandidates.length} chưa có lịch
          </p>
        </div>

        <Button
          type="button"
          disabled={selectedCandidates.length === 0}
          onClick={() => onOpenScheduler(activeRound, selectedCandidates)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-5 py-2.5 shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Tạo Lịch Hàng Loạt ({selectedCandidates.length} ứng viên chưa lịch)</span>
        </Button>
      </div>

      {/* 3. Section 1: Lịch Phỏng Vấn Chưa Xác Nhận */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm">
            Lịch Phỏng Vấn Chưa Xác Nhận ({unconfirmedCandidates.length})
          </h4>
          <span className="text-xs text-slate-400 font-medium ml-2">
            (Chỉ chọn checkbox được ứng viên chưa có lịch để tạo lịch nhóm)
          </span>
        </div>

        {unconfirmedCandidates.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 font-medium">
            Không có lịch hẹn nào đang chờ xác nhận ở vòng này.
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        disabled={schedulableCandidates.length === 0}
                        checked={
                          schedulableCandidates.length > 0 &&
                          schedulableCandidates.every((c) => selectedCandidates.includes(c.applicationId))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCandidates(schedulableCandidates.map((c) => c.applicationId))
                          } else {
                            setSelectedCandidates([])
                          }
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer disabled:opacity-40"
                        title="Tích chọn tất cả ứng viên chưa có lịch"
                      />
                    </th>
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-4">Ứng viên</th>
                    <th className="py-3 px-4">Vị trí</th>
                    <th className="py-3 px-4">Trạng thái lịch</th>
                    <th className="py-3 px-4">Số lần đổi lịch</th>
                    <th className="py-3 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {unconfirmedCandidates.map((cand, idx) => {
                    const isSchedulable = cand.status === 'NOT_STARTED' || !cand.scheduledTime || cand.scheduledTime.includes('Chưa')
                    const isSelected = selectedCandidates.includes(cand.applicationId)
                    const isRescheduleCapped = cand.rescheduleCount >= 3

                    return (
                      <tr
                        key={cand.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          {isSchedulable ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(cand.applicationId)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              disabled
                              checked={false}
                              title="Ứng viên này đã gửi slot / xin đổi lịch. Vui lòng dùng nút tại cột Thao tác"
                              className="rounded border-slate-200 text-slate-300 w-4 h-4 cursor-not-allowed opacity-40"
                            />
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {cand.candidateName}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                          {cand.jobTitle}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-amber-700 dark:text-amber-300">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[11px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {cand.scheduledTime || 'Chờ gửi lịch'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 text-[11px] font-extrabold rounded-full border ${
                              isRescheduleCapped
                                ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40'
                                : cand.rescheduleCount > 0
                                ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40'
                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800'
                            }`}
                          >
                            Đổi lịch: {cand.rescheduleCount}/3 lần
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {cand.status === 'RESCHEDULED' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    toast.success(`Đã chấp nhận lịch đề xuất của ${cand.candidateName}!`)
                                    cand.status = 'CONFIRMED'
                                    if (cand.scheduledTime?.includes('Đề xuất đổi lịch sang')) {
                                      cand.scheduledTime = cand.scheduledTime.replace('Đề xuất đổi lịch sang ', '')
                                    }
                                  }}
                                  className="px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Chấp nhận lịch
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onOpenScheduler(activeRound, [cand.applicationId])}
                                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                                >
                                  Gửi slot khác
                                </button>
                              </>
                            ) : cand.status === 'SLOTS_SENT' ? (
                              <button
                                type="button"
                                onClick={() => toast.success(`Đã gửi email nhắc nhở cho ${cand.candidateName} chốt lịch!`)}
                                className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer"
                              >
                                Gửi nhắc nhở
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onOpenScheduler(activeRound, [cand.applicationId])}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                Tạo lịch phỏng vấn
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 4. Section 2: Lịch Phỏng Vấn ĐÃ XÁC NHẬN (Cấp 1 gom theo NGÀY -> Cấp 2 gom theo GIỜ) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm">
            Lịch Phỏng Vấn Đã Chốt Đã Xác Nhận ({confirmedCandidates.length})
          </h4>
          <span className="text-xs text-emerald-600 font-bold ml-2">
            (Gom chung Ô theo Ngày & Gộp cột Hàng đối với ứng viên trùng giờ phỏng vấn)
          </span>
        </div>

        {confirmedDateAndSlotGroups.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400 font-medium">
            Chưa có ứng viên nào chốt lịch phỏng vấn chính thức ở vòng này.
          </div>
        ) : (
          <div className="space-y-6">
            {confirmedDateAndSlotGroups.map(({ dateStr, totalCandidates, timeSlots }) => (
              <div
                key={dateStr}
                className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Header Ô Ngày Phỏng Vấn */}
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 px-5 py-3 border-b border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-2.5 text-emerald-900 dark:text-emerald-300 font-black text-sm">
                    <Calendar className="w-4.5 h-4.5 text-emerald-600" />
                    <span>Lịch Phỏng Vấn Ngày {dateStr}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-xs">
                    <Users className="w-3.5 h-3.5" />
                    {totalCandidates} ứng viên trong ngày
                  </span>
                </div>

                {/* Bảng Chi Tiết: Gộp Ô Giờ nếu trùng giờ phỏng vấn */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-5 w-44">Giờ phỏng vấn</th>
                        <th className="py-2.5 px-4">Ứng viên</th>
                        <th className="py-2.5 px-4">Vị trí</th>
                        <th className="py-2.5 px-4">Ghi chú / feedback</th>
                        <th className="py-2.5 px-5 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {timeSlots.map(([timeStr, groupCands]) => (
                        <React.Fragment key={timeStr}>
                          {groupCands.map((cand, idx) => (
                            <tr
                              key={cand.id}
                              className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                            >
                              {idx === 0 && (
                                <td
                                  rowSpan={groupCands.length}
                                  className="py-3.5 px-5 font-bold align-top border-r border-slate-100 dark:border-slate-800 bg-emerald-50/20 dark:bg-emerald-950/10"
                                >
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-xs border border-emerald-200 dark:border-emerald-800">
                                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                      {timeStr}
                                    </span>
                                    {groupCands.length > 1 && (
                                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                        👥 Gộp {groupCands.length} ứng viên
                                      </p>
                                    )}
                                  </div>
                                </td>
                              )}
                              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                                {cand.candidateName}
                              </td>
                              <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                                {cand.jobTitle}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 font-medium max-w-xs truncate">
                                {cand.feedbackNote ? (
                                  <span className="italic text-slate-600 dark:text-slate-300">
                                    {cand.feedbackNote}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleOpenEvaluationModal(cand)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <Star className="w-3.5 h-3.5 fill-white" />
                                  <span>Đánh giá Vòng {activeRound}</span>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Round Evaluation Modal */}
      {evaluatingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Đánh giá Kết quả - {evaluatingCandidate.candidateName}
              </h3>
              <button
                onClick={() => setEvaluatingCandidate(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Đánh giá điểm số (1 - 5 sao):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nhận xét & Feedback về ứng viên vòng {activeRound}:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập chi tiết đánh giá chuyên môn, thái độ, kỹ năng giao tiếp..."
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                onClick={handleFail}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
              >
                Không Đạt (Loại)
              </Button>
              <Button
                type="button"
                onClick={handlePass}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
              >
                Đạt - Chuyển Vòng Kế Tiếp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
