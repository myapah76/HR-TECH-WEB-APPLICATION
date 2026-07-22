'use client'

import React, { useState } from 'react'
import { X, Calendar, Clock, Plus, Trash2, MapPin, Link as LinkIcon, Users } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { AvailableSlot } from '@/src/types/recruiter-interview'
import { toast } from 'sonner'

interface MultiSlotSchedulerModalProps {
  isOpen: boolean
  onClose: () => void
  candidateNames: string[]
  roundNumber: number
  roundName: string
  onSubmit: (slots: AvailableSlot[], note?: string) => void
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

interface SlotInputState {
  id: string
  date: string
  startHour: string
  endHour: string
  location: string
  meetingLink: string
}

export default function MultiSlotSchedulerModal({
  isOpen,
  onClose,
  candidateNames,
  roundNumber,
  roundName,
  onSubmit,
}: MultiSlotSchedulerModalProps) {
  const getTodayString = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const [slots, setSlots] = useState<SlotInputState[]>([
    {
      id: '1',
      date: getTodayString(),
      startHour: '09:00',
      endHour: '10:00',
      location: '',
      meetingLink: '',
    },
  ])
  const [note, setNote] = useState('')

  if (!isOpen) return null

  const handleAddSlot = () => {
    const lastSlot = slots[slots.length - 1]
    setSlots([
      ...slots,
      {
        id: String(Date.now()),
        date: lastSlot?.date || getTodayString(),
        startHour: '09:00',
        endHour: '10:00',
        location: lastSlot?.location || '',
        meetingLink: lastSlot?.meetingLink || '',
      },
    ])
  }

  const handleRemoveSlot = (id: string) => {
    if (slots.length <= 1) return
    setSlots(slots.filter((s) => s.id !== id))
  }

  const handleSlotChange = (id: string, updates: Partial<SlotInputState>) => {
    setSlots(
      slots.map((s) => {
        if (s.id !== id) return s
        const updated = { ...s, ...updates }

        // Enforce startHour < endHour automatically
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

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate slots
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]
      if (!slot.date) {
        toast.error(`Vui lòng chọn ngày cho Khung giờ ${i + 1}`)
        return
      }
      const startIdx = HOURLY_OPTIONS.indexOf(slot.startHour)
      const endIdx = HOURLY_OPTIONS.indexOf(slot.endHour)
      if (startIdx >= endIdx) {
        toast.error(`Khung giờ ${i + 1}: Giờ kết thúc phải muộn hơn Giờ bắt đầu!`)
        return
      }
    }

    const formattedSlots: AvailableSlot[] = slots.map((s) => {
      const startIso = new Date(`${s.date}T${s.startHour}:00`).toISOString()
      const endIso = new Date(`${s.date}T${s.endHour}:00`).toISOString()
      return {
        id: s.id,
        startTime: startIso,
        endTime: endIso,
        location: s.location,
        meetingLink: s.meetingLink,
      }
    })

    onSubmit(formattedSlots, note)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                Tạo Lịch Phỏng Vấn (Chọn Ngày & Giờ)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {roundName} (Vòng {roundNumber}) • {candidateNames.length} Ứng viên được chọn
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

        <form onSubmit={handleConfirm} className="p-6 space-y-6">
          {/* Candidate Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              Ứng viên nhận lịch phỏng vấn:
            </label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
              {candidateNames.map((name, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-200 dark:border-emerald-800"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Time Slots List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                Các Khung giờ Rảnh để Ứng viên lựa chọn:
              </label>
              <button
                type="button"
                onClick={handleAddSlot}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm khung giờ
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {slots.map((slot, index) => {
                const startIdx = HOURLY_OPTIONS.indexOf(slot.startHour)

                return (
                  <div
                    key={slot.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Khung giờ {index + 1}</span>
                      {slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(slot.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Step 1: Date Picker */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        1. Chọn Ngày phỏng vấn:
                      </span>
                      <input
                        type="date"
                        required
                        min={getTodayString()}
                        value={slot.date}
                        onChange={(e) => handleSlotChange(slot.id, { date: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Step 2: Start & End Hour Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          2. Giờ bắt đầu (Mốc giờ tròn):
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
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          3. Giờ kết thúc (Vô hiệu hóa ≤ Giờ bắt đầu):
                        </span>
                        <select
                          value={slot.endHour}
                          onChange={(e) => handleSlotChange(slot.id, { endHour: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          {HOURLY_OPTIONS.map((hour, idx) => {
                            const isDisabled = idx <= startIdx
                            return (
                              <option key={hour} value={hour} disabled={isDisabled}>
                                {hour} {isDisabled ? '⛔ (không hợp lệ)' : ''}
                              </option>
                            )
                          })}
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
                          placeholder="Ví dụ: Tầng 5, Tòa nhà FPT Tower..."
                          value={slot.location}
                          onChange={(e) => handleSlotChange(slot.id, { location: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-slate-400" /> Link Google Meet (Online):
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
          </div>

          {/* Note for Candidate */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Ghi chú gửi Ứng viên:
            </label>
            <textarea
              rows={2}
              placeholder="Vui lòng chuẩn bị trang phục lịch sự và mang theo giấy tờ tùy thân..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-bold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-6"
            >
              Gửi Lịch Cho Ứng Viên
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
