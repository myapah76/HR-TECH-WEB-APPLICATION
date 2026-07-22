'use client'

import React, { useState } from 'react'
import { X, Calendar, Check, AlertTriangle, Clock, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { InterviewRoundDetail, AvailableSlot } from '@/src/types/recruiter-interview'
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

interface NewSlotInput {
  date: string
  startHour: string
  endHour: string
  location: string
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
  const [newSlots, setNewSlots] = useState<NewSlotInput[]>([
    { date: getTodayString(), startHour: '09:00', endHour: '10:00', location: 'Phòng họp HR / Google Meet' },
  ])

  if (!candidate) return null

  const currentAttempts = candidate.rescheduleCount || 1
  const isFinalAttempt = currentAttempts >= 3

  const handleAddSlotRow = () => {
    const lastSlot = newSlots[newSlots.length - 1]
    setNewSlots((prev) => [
      ...prev,
      {
        date: lastSlot?.date || getTodayString(),
        startHour: '09:00',
        endHour: '10:00',
        location: lastSlot?.location || 'Phòng họp HR / Google Meet',
      },
    ])
  }

  const handleRemoveSlotRow = (index: number) => {
    if (newSlots.length <= 1) return
    setNewSlots((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSlotChange = (index: number, updates: Partial<NewSlotInput>) => {
    setNewSlots((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s
        const updated = { ...s, ...updates }
        if (updates.startHour) {
          const startIdx = HOURLY_OPTIONS.indexOf(updates.startHour)
          const endIdx = HOURLY_OPTIONS.indexOf(updated.endHour)
          if (endIdx <= startIdx && startIdx < HOURLY_OPTIONS.length - 1) {
            updated.endHour = HOURLY_OPTIONS[startIdx + 1]
          }
        }
        return updated
      })
    )
  }

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối đề xuất đổi lịch của ứng viên!')
      return
    }

    const formattedSlots: AvailableSlot[] = []

    if (!isFinalAttempt) {
      for (let i = 0; i < newSlots.length; i++) {
        const s = newSlots[i]
        if (!s.date) {
          toast.error(`Vui lòng chọn ngày cho Slot ${i + 1}`)
          return
        }
        const startIdx = HOURLY_OPTIONS.indexOf(s.startHour)
        const endIdx = HOURLY_OPTIONS.indexOf(s.endHour)
        if (startIdx >= endIdx) {
          toast.error(`Slot ${i + 1}: Giờ kết thúc phải muộn hơn Giờ bắt đầu!`)
          return
        }

        const startIso = new Date(`${s.date}T${s.startHour}:00`).toISOString()
        const endIso = new Date(`${s.date}T${s.endHour}:00`).toISOString()

        formattedSlots.push({
          id: `slot-hr-${Date.now()}-${i}`,
          startTime: startIso,
          endTime: endIso,
          location: s.location,
        })
      }

      if (formattedSlots.length === 0) {
        toast.error('Vui lòng tạo ít nhất 1 khung giờ rảnh mới để gửi ứng viên chọn!')
        return
      }
    }

    onRejectAndOfferNewSlots(candidate.applicationId, rejectionReason.trim(), formattedSlots, isFinalAttempt)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                Duyệt Yêu Cầu Đổi Lịch Phỏng Vấn
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Ứng viên: <strong>{candidate.candidateName}</strong> ({candidate.jobTitle})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attempt Count Banner */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
            Số lần xin đổi lịch:
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
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Thời gian đề xuất: {candidate.candidatePreferredTime || candidate.scheduledTime || 'Chưa rõ'}</span>
          </div>
          {candidate.candidateRescheduleReason && (
            <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              &quot;{candidate.candidateRescheduleReason}&quot;
            </p>
          )}
        </div>

        {/* Rejection Form view when HR wants to refuse candidate's time */}
        {mode === 'REJECT_FORM' ? (
          <div className="space-y-4 pt-2">
            {isFinalAttempt && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Đây là lần xin đổi lịch thứ 3 (cuối cùng). Nếu từ chối, ứng tuyển sẽ bị dừng luồng (Terminated) và tự động gửi email từ chối.
                </span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Lý do HR không thể phỏng vấn khung giờ này <span className="text-rose-500">*</span>:
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ví dụ: Trùng lịch họp Ban Giám Đốc, phòng họp đầy..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
              />
            </div>

            {!isFinalAttempt && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Đề xuất danh sách ngày/giờ HR có thể phỏng vấn:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSlotRow}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm slot
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {newSlots.map((slot, i) => {
                    const startIdx = HOURLY_OPTIONS.indexOf(slot.startHour)
                    return (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>Khung giờ đề xuất {i + 1}</span>
                          {newSlots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSlotRow(i)}
                              className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Ngày:</span>
                          <input
                            type="date"
                            min={getTodayString()}
                            value={slot.date}
                            onChange={(e) => handleSlotChange(i, { date: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Giờ bắt đầu:</span>
                            <select
                              value={slot.startHour}
                              onChange={(e) => handleSlotChange(i, { startHour: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none cursor-pointer"
                            >
                              {HOURLY_OPTIONS.map((hour) => (
                                <option key={hour} value={hour}>
                                  {hour}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Giờ kết thúc:</span>
                            <select
                              value={slot.endHour}
                              onChange={(e) => handleSlotChange(i, { endHour: e.target.value })}
                              className="w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none cursor-pointer"
                            >
                              {HOURLY_OPTIONS.map((hour, idx) => {
                                const isDisabled = idx <= startIdx
                                return (
                                  <option key={hour} value={hour} disabled={isDisabled}>
                                    {hour} {isDisabled ? '⛔' : ''}
                                  </option>
                                )
                              })}
                            </select>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={slot.location}
                          onChange={(e) => handleSlotChange(i, { location: e.target.value })}
                          placeholder="Địa điểm / Link meet"
                          className="w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMode('VIEW')}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Quay lại
              </button>
              <Button
                type="button"
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {isFinalAttempt ? 'Xác nhận Từ Chối & Dừng Luồng' : 'Xác nhận Từ Chối & Gửi Slot Mới'}
              </Button>
            </div>
          </div>
        ) : (
          /* View Mode Buttons */
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              onClick={() => setMode('REJECT_FORM')}
              className="bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold rounded-xl cursor-pointer"
            >
              Từ Chối Đề Xuất
            </Button>
            <Button
              type="button"
              onClick={() => onAcceptCandidateTime(candidate.applicationId)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Chấp Nhận Thời Gian Ứng Viên Chấm</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
