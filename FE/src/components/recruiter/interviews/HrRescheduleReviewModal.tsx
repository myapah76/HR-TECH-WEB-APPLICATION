'use client'

import React, { useState } from 'react'
import { X, Calendar, Check, AlertTriangle, Clock, Plus, Trash2, MapPin, Link as LinkIcon, Sparkles, Timer } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { InterviewRoundDetail, AvailableSlot } from '@/src/types/recruiter-interview'
import { useGetApplicationInterviewRounds } from '@/src/hooks/application'
import { formatDateTime } from '@/src/utils'
import { toast } from 'sonner'

interface HrRescheduleReviewModalProps {
  candidate: InterviewRoundDetail | null
  onClose: () => void
  onAcceptCandidateTime: (candidateId: string) => void
  onRejectAndOfferNewSlots: (
    candidateId: string,
    rejectionReason: string,
    newSlots: AvailableSlot[],
    isTerminated: boolean
  ) => void
}

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

const DURATION_OPTIONS = [
  { value: 30, label: '30 phút' },
  { value: 45, label: '45 phút' },
  { value: 60, label: '60 phút (1 giờ)' },
  { value: 90, label: '90 phút (1.5 giờ)' },
  { value: 120, label: '120 phút (2 giờ)' },
]

interface NewSlotInput {
  id: string
  date: string
  startHour: string
  durationMinutes: number
  location: string
  meetingLink: string
}

export default function HrRescheduleReviewModal({
  candidate,
  onClose,
  onAcceptCandidateTime,
  onRejectAndOfferNewSlots,
}: HrRescheduleReviewModalProps) {
  const getTodayString = () => new Date().toISOString().split('T')[0]

  const [mode, setMode] = useState<'VIEW' | 'REJECT_FORM'>('VIEW')
  const [rejectionReason, setRejectionReason] = useState('')
  const [newSlots, setNewSlots] = useState<NewSlotInput[]>([])

  const { data: rounds = [] } = useGetApplicationInterviewRounds(candidate?.applicationId || '')
  const roundData = rounds.find((r: any) => r.roundNumber === candidate?.roundNumber) || rounds[rounds.length - 1]

  const [existingSlots, setExistingSlots] = useState<any[]>([])

  React.useEffect(() => {
    if (roundData?.slots) {
      setExistingSlots(roundData.slots)
    }
  }, [roundData?.slots])

  const handleRemoveExistingSlot = (slotId: string) => {
    setExistingSlots((prev) => prev.filter((s) => (s.id || s.startTime) !== slotId))
    toast.success('Đã xoá khung giờ phỏng vấn cũ!')
  }

  const handleClearAllExistingSlots = () => {
    setExistingSlots([])
    toast.success('Đã xoá toàn bộ khung giờ phỏng vấn cũ!')
  }

  if (!candidate) return null

  const currentAttempts = roundData?.rescheduleCount ?? candidate.rescheduleCount ?? 0
  const isFinalAttempt = currentAttempts >= 3

  const preferredTimeRaw = roundData?.candidatePreferredTime || candidate.candidatePreferredTime
  const formattedPreferredTime = preferredTimeRaw
    ? formatDateTime(preferredTimeRaw)
    : candidate.scheduledTime
    ? formatDateTime(candidate.scheduledTime)
    : 'Chưa rõ'

  const candidateReason = roundData?.candidateRescheduleReason || candidate.candidateRescheduleReason || ''

  const handleAddSlotRow = () => {
    const lastSlot = newSlots[newSlots.length - 1]
    setNewSlots((prev) => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        date: lastSlot?.date || getTodayString(),
        startHour: '09:00',
        durationMinutes: lastSlot?.durationMinutes || 60,
        location: lastSlot?.location || 'Phòng họp HR',
        meetingLink: lastSlot?.meetingLink || '',
      },
    ])
  }

  const handleRemoveSlotRow = (id: string) => {
    setNewSlots((prev) => prev.filter((s) => s.id !== id))
  }

  const handleSlotChange = (id: string, updates: Partial<NewSlotInput>) => {
    setNewSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        return { ...s, ...updates }
      })
    )
  }

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối đề xuất đổi lịch của ứng viên!')
      return
    }

    const formattedSlots: AvailableSlot[] = []

    // 1. Keep remaining existing slots that HR did NOT delete (marked as NOT new)
    if (existingSlots && existingSlots.length > 0) {
      existingSlots.forEach((s) => {
        formattedSlots.push({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          location: s.location,
          meetingLink: s.meetingLink,
          isNewSlot: false,
        })
      })
    }

    // 2. Append newly added slots (marked as NEW)
    if (!isFinalAttempt) {
      for (let i = 0; i < newSlots.length; i++) {
        const s = newSlots[i]
        if (!s.date) {
          toast.error(`Vui lòng chọn ngày cho Khung giờ bổ sung ${i + 1}`)
          return
        }

        const startDate = new Date(`${s.date}T${s.startHour}:00`)
        const endDate = new Date(startDate.getTime() + s.durationMinutes * 60 * 1000)

        formattedSlots.push({
          id: s.id,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          location: s.location,
          meetingLink: s.meetingLink,
          isNewSlot: true,
        })
      }
    }

    // 3. Frontend overlap validation among all slots
    for (let i = 0; i < formattedSlots.length; i++) {
      const s1Start = new Date(formattedSlots[i].startTime).getTime()
      const s1End = new Date(formattedSlots[i].endTime).getTime()

      for (let j = i + 1; j < formattedSlots.length; j++) {
        const s2Start = new Date(formattedSlots[j].startTime).getTime()
        const s2End = new Date(formattedSlots[j].endTime).getTime()

        if (s1Start < s2End && s1End > s2Start) {
          toast.error(`Có khung giờ phỏng vấn bị trùng lặp thời gian với nhau! Vui lòng kiểm tra lại.`)
          return
        }
      }
    }

    onRejectAndOfferNewSlots(candidate.applicationId, rejectionReason.trim(), formattedSlots, isFinalAttempt)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl transition-all duration-300 w-full overflow-hidden ${
          mode === 'REJECT_FORM' ? 'max-w-4xl' : 'max-w-lg'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-900">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                Duyệt Yêu Cầu Đổi Lịch Phỏng Vấn
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ứng viên: <strong>{candidate.candidateName}</strong> ({candidate.jobTitle})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {mode === 'VIEW' ? (
            /* ── VIEW MODE (COMPACT VIEW) ─────────────────────────────────── */
            <div className="space-y-5">
              {/* Attempt Count Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Số lần ứng viên đã xin đổi lịch:
                </span>
                <span
                  className={`px-3 py-1 text-xs font-black rounded-full border ${
                    isFinalAttempt
                      ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200'
                  }`}
                >
                  Lần {currentAttempts} / 3 lần tối đa
                </span>
              </div>

              {/* Candidate Request Info */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Nội dung đề xuất từ ứng viên:
                </p>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Thời gian đề xuất: <strong className="text-emerald-700 dark:text-emerald-400">{formattedPreferredTime}</strong></span>
                </div>
                {candidateReason && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    Lý do xin đổi: &quot;{candidateReason}&quot;
                  </p>
                )}
              </div>

              {/* Original Sent Slots Display (Read-Only in VIEW Mode) */}
              {roundData?.slots && roundData.slots.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-2.5">
                  <p className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Các khung giờ HR đã gửi ban đầu ({roundData.slots.length} slots):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-40 overflow-y-auto pr-1">
                    {roundData.slots.map((slot: any, idx: number) => (
                      <div key={slot.id || idx} className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-200/60 flex flex-col justify-between gap-1 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-blue-700 uppercase">Slot #{idx + 1}</span>
                          {slot.location && (
                            <span className="text-[10px] text-slate-400 truncate max-w-28">📍 {slot.location}</span>
                          )}
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                          {formatDateTime(slot.startTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons in VIEW mode */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto rounded-xl text-xs font-bold"
                >
                  Đóng
                </Button>
                <Button
                  type="button"
                  onClick={() => setMode('REJECT_FORM')}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Từ chối &amp; Đề xuất slot mới
                </Button>
                <Button
                  type="button"
                  onClick={() => onAcceptCandidateTime(candidate.applicationId)}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-6 shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Duyệt giờ ứng viên chọn</span>
                </Button>
              </div>
            </div>
          ) : (
            /* ── REJECT FORM MODE (EXPANDED 2-COLUMN SIDE-BY-SIDE VIEW) ─────── */
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── LEFT COLUMN: Rejection Reason & Request Info ────────────── */}
                <div className="space-y-4">
                  {isFinalAttempt && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        Đây là lần xin đổi lịch thứ 3 (cuối cùng). Nếu từ chối, ứng tuyển sẽ bị dừng luồng (Terminated) và tự động gửi email từ chối.
                      </span>
                    </div>
                  )}

                  {/* Candidate Request Info */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      Đề xuất từ ứng viên (Lần {currentAttempts}/3):
                    </p>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Thời gian: <strong className="text-emerald-700 dark:text-emerald-400">{formattedPreferredTime}</strong></span>
                    </div>
                    {candidateReason && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        Lý do: &quot;{candidateReason}&quot;
                      </p>
                    )}
                  </div>

                  {/* Original Sent Slots */}
                  {existingSlots && existingSlots.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                          Khung giờ HR đã gửi ({existingSlots.length} slots):
                        </p>
                        <button
                          type="button"
                          onClick={handleClearAllExistingSlots}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {existingSlots.map((slot: any, idx: number) => (
                          <div key={slot.id || idx} className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-200/60 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              {formatDateTime(slot.startTime)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-slate-400">Slot #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingSlot(slot.id || slot.startTime)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded cursor-pointer transition-colors"
                                title="Xóa slot này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason Form */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Lý do HR từ chối giờ ứng viên đề xuất <span className="text-rose-500">*</span>:
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Ví dụ: Trùng lịch họp Ban Giám Đốc, phòng họp bận..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* ── RIGHT COLUMN: Multi-Slot Creation & Management ──────────── */}
                <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                  {!isFinalAttempt ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-emerald-600" />
                          Thêm khung giờ rảnh mới (Tùy chọn):
                        </label>
                        <button
                          type="button"
                          onClick={handleAddSlotRow}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm khung giờ bổ sung
                        </button>
                      </div>

                      {newSlots.length === 0 ? (
                        <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl space-y-2">
                          <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
                          <p className="text-xs font-semibold text-slate-500">
                            Chưa có khung giờ bổ sung nào.
                          </p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Nếu muốn gửi thêm lựa chọn thời gian mới cho ứng viên, bấm nút <strong className="text-emerald-600">&quot;+ Thêm khung giờ bổ sung&quot;</strong> ở trên.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                          {newSlots.map((slot, i) => {
                            return (
                              <div key={slot.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3 relative group">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                  <span>Khung giờ bổ sung #{i + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSlotRow(slot.id)}
                                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                                    title="Xóa khung giờ này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Step 1: Date */}
                                <div>
                                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                                    1. Chọn Ngày phỏng vấn:
                                  </span>
                                  <input
                                    type="date"
                                    min={getTodayString()}
                                    value={slot.date}
                                    onChange={(e) => handleSlotChange(slot.id, { date: e.target.value })}
                                    className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                                  />
                                </div>

                                {/* Step 2 & 3: Start Hour & Duration */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-emerald-600" />
                                      2. Giờ bắt đầu:
                                    </span>
                                    <select
                                      value={slot.startHour}
                                      onChange={(e) => handleSlotChange(slot.id, { startHour: e.target.value })}
                                      className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 cursor-pointer"
                                    >
                                      {HOURLY_OPTIONS.map((hour) => (
                                        <option key={hour} value={hour}>
                                          {hour}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1 flex items-center gap-1">
                                      <Timer className="w-3 h-3 text-amber-600" />
                                      3. Thời lượng:
                                    </span>
                                    <select
                                      value={slot.durationMinutes}
                                      onChange={(e) => handleSlotChange(slot.id, { durationMinutes: Number(e.target.value) })}
                                      className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 cursor-pointer"
                                    >
                                      {DURATION_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* Location & Meeting Link */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                  <div>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-slate-400" /> Địa điểm (Offline):
                                    </span>
                                    <input
                                      type="text"
                                      placeholder="VD: Phòng họp HR..."
                                      value={slot.location}
                                      onChange={(e) => handleSlotChange(slot.id, { location: e.target.value })}
                                      className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                                      <LinkIcon className="w-3 h-3 text-slate-400" /> Link Meet (Online):
                                    </span>
                                    <input
                                      type="url"
                                      placeholder="https://meet.google.com/..."
                                      value={slot.meetingLink}
                                      onChange={(e) => handleSlotChange(slot.id, { meetingLink: e.target.value })}
                                      className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-2">
                      <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
                      <h4 className="text-xs font-extrabold text-rose-800 dark:text-rose-300">
                        Đã Đạt Giới Hạn 3 Lần Đổi Lịch
                      </h4>
                      <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 leading-relaxed">
                        Hệ thống không cho phép tạo thêm khung giờ mới. Khi từ chối, quy trình phỏng vấn sẽ bị kết thúc (Terminated) và gửi email từ chối tới ứng viên.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons in Reject Form Mode */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode('VIEW')}
                  className="rounded-xl text-xs font-bold"
                >
                  Quay lại
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmReject}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold px-6 shadow-xs"
                >
                  {isFinalAttempt
                    ? 'Xác nhận Từ chối & Dừng Luồng'
                    : newSlots.length > 0
                    ? `Từ chối & Gửi ${newSlots.length} Slot Bổ Sung`
                    : 'Gửi Từ Chối (Không Thêm Slot)'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
