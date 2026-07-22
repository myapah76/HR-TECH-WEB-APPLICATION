'use client'

import React, { useMemo } from 'react'
import { Clock, CheckCircle2, Check, XCircle, Calendar, Star, Users, AlertTriangle, Award, UserCheck } from 'lucide-react'
import { InterviewRoundDetail } from '@/src/types/recruiter-interview'
import Pagination from '@/src/components/common/Pagination'
import { formatDateTime } from '@/src/utils'
import { toast } from 'sonner'

interface JobInterviewsTableProps {
  candidates: InterviewRoundDetail[]
  totalItems: number
  activeRound: number
  isConfigured: boolean
  selectedIds: Set<string>
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (size: number) => void
  onToggleSelect: (id: string) => void
  onToggleSelectAll: (checked: boolean) => void
  onOpenScheduler: (appId: string) => void
  onOpenViewSlots: (appId: string) => void
  onCheckInCandidate: (cand: InterviewRoundDetail) => void
  onOpenEvaluationModal: (cand: InterviewRoundDetail) => void
  onOpenNoShowConfirmModal?: (cand: InterviewRoundDetail) => void
  onOpenRescheduleReviewModal: (cand: InterviewRoundDetail) => void
  onOpenFinalConfirmationModal: (cand: InterviewRoundDetail) => void
  onOpenViewEvaluationResult?: (cand: InterviewRoundDetail) => void
  onOpenConfigModal: () => void
}

export default function JobInterviewsTable({
  candidates,
  totalItems,
  activeRound,
  isConfigured,
  selectedIds,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onToggleSelect,
  onToggleSelectAll,
  onOpenScheduler,
  onOpenViewSlots,
  onCheckInCandidate,
  onOpenEvaluationModal,
  onOpenNoShowConfirmModal,
  onOpenRescheduleReviewModal,
  onOpenFinalConfirmationModal,
  onOpenViewEvaluationResult,
  onOpenConfigModal,
}: JobInterviewsTableProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1

  // ── Phân loại riêng các ứng viên ĐÃ CHỐT LỊCH để gom ô theo Ngày & Giờ ────────
  const confirmedCandidates = useMemo(
    () =>
      candidates.filter(
        (c) => (c.status === 'CONFIRMED' || c.status === 'ATTENDED') && c.scheduledTime && !c.scheduledTime.includes('Chờ')
      ),
    [candidates]
  )

  const confirmedDateAndSlotGroups = useMemo(() => {
    const dateGroups: Record<string, Record<string, InterviewRoundDetail[]>> = {}

    confirmedCandidates.forEach((cand) => {
      let datePart = 'Chưa rõ ngày'
      let timePart = '09:00'

      if (cand.scheduledTime) {
        try {
          const d = new Date(cand.scheduledTime)
          if (!isNaN(d.getTime())) {
            datePart = d.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
            timePart = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
          } else {
            datePart = cand.scheduledTime
          }
        } catch {
          datePart = cand.scheduledTime
        }
      }

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
      {/* ── BẢNG DANH SÁCH ỨNG VIÊN CHÍNH ───────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">
              {(() => {
                const schedulableCandidates = candidates.filter((c) => c.status === 'NOT_STARTED')
                const isAllSchedulableChecked =
                  schedulableCandidates.length > 0 &&
                  schedulableCandidates.every((c) => selectedIds.has(c.applicationId))

                return (
                  <input
                    type="checkbox"
                    disabled={!isConfigured || schedulableCandidates.length === 0}
                    checked={isAllSchedulableChecked}
                    onChange={(e) => onToggleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer disabled:opacity-40"
                    title="Tích chọn tất cả ứng viên chưa xếp lịch"
                  />
                )
              })()}
                </th>
                <th className="py-3 px-3 text-center w-12">STT</th>
                <th className="py-3 px-4">Ứng viên &amp; Vị trí</th>
                <th className="py-3 px-4">Vòng phỏng vấn</th>
                <th className="py-3 px-4">Trạng thái phỏng vấn</th>
                <th className="py-3 px-4">Thời gian phỏng vấn</th>
                <th className="py-3 px-4">Số lần đổi lịch</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    Không tìm thấy ứng viên nào phù hợp trong vòng này.
                  </td>
                </tr>
              ) : (
                candidates.map((cand, idx) => {
                  const isSelected = selectedIds.has(cand.applicationId)
                  const canSchedule = cand.status === 'NOT_STARTED'
                  return (
                    <tr
                      key={cand.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/30' : ''
                      } ${!isConfigured ? 'opacity-85' : ''}`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!isConfigured || !canSchedule}
                          onChange={() => onToggleSelect(cand.applicationId)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title={!canSchedule ? 'Ứng viên này đã được xếp lịch / đang phỏng vấn' : 'Chọn ứng viên'}
                        />
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-400">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {cand.candidateName}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500">
                          {cand.jobTitle}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {cand.roundName}
                      </td>
                      <td className="py-3.5 px-4">
                        {cand.status === 'CONFIRMED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đã chốt lịch
                          </span>
                        ) : cand.status === 'ATTENDED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/40 text-[11px] font-extrabold text-teal-700 dark:text-teal-300">
                            <UserCheck className="w-3 h-3 text-teal-600" />
                            Đã Phỏng Vấn (Chờ chấm)
                          </span>
                        ) : cand.status === 'SLOTS_SENT' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/40 text-[11px] font-extrabold text-teal-700 dark:text-teal-300">
                            <Clock className="w-3 h-3 text-teal-600" />
                            Đã gửi lịch
                          </span>
                        ) : cand.status === 'RESCHEDULE_REQUESTED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[11px] font-extrabold text-amber-700 dark:text-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Ứng viên xin đổi lịch
                          </span>
                        ) : cand.status === 'RESCHEDULE_REJECTED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 text-[11px] font-extrabold text-purple-700 dark:text-purple-300">
                            <Clock className="w-3 h-3 text-purple-600" />
                            Đã đề xuất slot rảnh khác
                          </span>
                        ) : cand.status === 'INTERVIEW_COMPLETED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300">
                            <Award className="w-3 h-3 text-indigo-600" />
                            Hoàn Thành Các Vòng
                          </span>
                        ) : cand.status === 'PASSED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-[11px] font-extrabold text-blue-700 dark:text-blue-300">
                            <Check className="w-3 h-3 text-blue-600" />
                            Đã Đạt Vòng {activeRound}
                          </span>
                        ) : cand.status === 'FAILED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-[11px] font-extrabold text-rose-700 dark:text-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Loại / Không đạt
                          </span>
                        ) : cand.status === 'TERMINATED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] font-extrabold text-slate-600 dark:text-slate-400">
                            <XCircle className="w-3 h-3 text-slate-500" />
                            Dừng luồng (Đổi lịch &gt; 3 lần)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Chưa xếp lịch
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-slate-200">
                        {cand.scheduledTime ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-800 dark:text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {formatDateTime(cand.scheduledTime)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">Chưa chốt</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-extrabold rounded-full ${
                            cand.rescheduleCount >= 3
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : cand.rescheduleCount > 0
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {cand.rescheduleCount}/3 lần
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Always allow viewing previous rounds history if available */}
                          {cand.previousRoundsHistory && cand.previousRoundsHistory.length > 0 && cand.status !== 'PASSED' && cand.status !== 'FAILED' && cand.status !== 'TERMINATED' && (
                            <button
                              type="button"
                              onClick={() => onOpenViewEvaluationResult?.(cand)}
                              className="px-2.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs shrink-0"
                              title="Xem kết quả đánh giá các vòng trước"
                            >
                              <Award className="w-3.5 h-3.5 text-blue-600" />
                              <span>Xem KQ Vòng trước</span>
                            </button>
                          )}

                          {!isConfigured ? (
                            <button
                              type="button"
                              onClick={() => {
                                toast.error('Vui lòng cấu hình quy trình phỏng vấn trước khi thao tác!')
                                onOpenConfigModal()
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                            >
                              Chưa cấu hình
                            </button>
                          ) : cand.status === 'SLOTS_SENT' ? (
                            <button
                              type="button"
                              onClick={() => onOpenViewSlots(cand.applicationId)}
                              className="px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                              title="Xem lịch đã gửi cho ứng viên"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Xem lịch đã gửi</span>
                            </button>
                          ) : cand.status === 'RESCHEDULE_REQUESTED' ? (
                            <button
                              type="button"
                              onClick={() => onOpenRescheduleReviewModal(cand)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Duyệt xin đổi lịch ({cand.rescheduleCount}/3)</span>
                            </button>
                          ) : cand.status === 'INTERVIEW_COMPLETED' ? (
                            <button
                              type="button"
                              onClick={() => onOpenFinalConfirmationModal(cand)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Duyệt Kết Quả Cuối Cùng</span>
                            </button>
                          ) : cand.status === 'CONFIRMED' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => onCheckInCandidate(cand)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                                title="Xác nhận ứng viên đã có mặt tham dự phỏng vấn"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Check-in (Điểm danh)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => (onOpenNoShowConfirmModal ? onOpenNoShowConfirmModal(cand) : onOpenEvaluationModal(cand))}
                                className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                                title="Đánh Fail trực tiếp nếu ứng viên không đến phỏng vấn (vắng mặt)"
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Đánh Fail (Vắng mặt)</span>
                              </button>
                            </div>
                          ) : cand.status === 'ATTENDED' ? (
                            <button
                              type="button"
                              onClick={() => onOpenEvaluationModal(cand)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                              title="Chấm điểm & nhận xét chuyên môn"
                            >
                              <Star className="w-3.5 h-3.5 fill-white" />
                              <span>Đánh giá Vòng {activeRound}</span>
                            </button>
                          ) : cand.status === 'PASSED' || cand.status === 'FAILED' || cand.status === 'TERMINATED' ? (
                            <button
                              type="button"
                              onClick={() => onOpenViewEvaluationResult?.(cand)}
                              className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                              title="Xem kết quả đánh giá chi tiết"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              <span>Xem kết quả đánh giá</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenScheduler(cand.applicationId)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Tạo lịch Vòng {activeRound}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (chỉ hiện khi totalItems > 10) */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>

      {/* ── SECTION: LỊCH PHỎNG VẤN ĐÃ CHỐT (GOM THEO NGÀY & GIỜ) ── */}
      {confirmedDateAndSlotGroups.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm">
              Lịch Phỏng Vấn Đã Chốt Theo Ngày & Giờ ({confirmedCandidates.length})
            </h4>
          </div>

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

                {/* Bảng Chi Tiết */}
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
                                <div className="flex items-center justify-end gap-2">
                                  {cand.previousRoundsHistory && cand.previousRoundsHistory.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenViewEvaluationResult?.(cand)}
                                      className="px-2.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-xs shrink-0"
                                      title="Xem kết quả đánh giá các vòng trước"
                                    >
                                      <Award className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Xem KQ Vòng trước</span>
                                    </button>
                                  )}

                                  {cand.status === 'CONFIRMED' ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => onCheckInCandidate(cand)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 shrink-0 cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-all"
                                        title="Xác nhận ứng viên đã tham dự phỏng vấn"
                                      >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>Check-in (Điểm danh)</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => (onOpenNoShowConfirmModal ? onOpenNoShowConfirmModal(cand) : onOpenEvaluationModal(cand))}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-xl px-3 py-1.5 shrink-0 cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-all"
                                        title="Đánh Fail trực tiếp nếu ứng viên vắng mặt"
                                      >
                                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Đánh Fail (Vắng mặt)</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => onOpenEvaluationModal(cand)}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 shrink-0 cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-all"
                                      title="Chấm điểm & nhận xét chuyên môn"
                                    >
                                      <Star className="w-3.5 h-3.5 fill-white" />
                                      <span>Đánh giá Vòng {activeRound}</span>
                                    </button>
                                  )}
                                </div>
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
        </div>
      )}
    </div>
  )
}
