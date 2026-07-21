'use client'

import React, { useState } from 'react'
import { X, Calendar, Clock, Plus, Trash2, MapPin, Link as LinkIcon, Users } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { AvailableSlot } from '@/src/types/recruiter-interview'

interface MultiSlotSchedulerModalProps {
  isOpen: boolean
  onClose: () => void
  candidateNames: string[]
  roundNumber: number
  roundName: string
  onSubmit: (slots: AvailableSlot[], note?: string) => void
}

export default function MultiSlotSchedulerModal({
  isOpen,
  onClose,
  candidateNames,
  roundNumber,
  roundName,
  onSubmit,
}: MultiSlotSchedulerModalProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([
    {
      id: '1',
      startTime: '',
      endTime: '',
      location: '',
      meetingLink: '',
    },
  ])
  const [note, setNote] = useState('')

  if (!isOpen) return null

  const handleAddSlot = () => {
    setSlots([
      ...slots,
      {
        id: String(Date.now()),
        startTime: '',
        endTime: '',
        location: slots[0]?.location || '',
        meetingLink: slots[0]?.meetingLink || '',
      },
    ])
  }

  const handleRemoveSlot = (id: string) => {
    if (slots.length <= 1) return
    setSlots(slots.filter((s) => s.id !== id))
  }

  const handleSlotChange = (id: string, field: keyof AvailableSlot, value: string) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(slots, note)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                Tạo Lịch Phỏng Vấn (Nhiều Khung Giờ)
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
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Ứng viên nhận lịch phỏng vấn:
            </label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
              {candidateNames.map((name, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-full border border-indigo-200 dark:border-indigo-800"
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
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Các Khung giờ Rảnh để Ứng viên lựa chọn:
              </label>
              <button
                type="button"
                onClick={handleAddSlot}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm khung giờ
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {slots.map((slot, index) => (
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                        Thời gian bắt đầu:
                      </span>
                      <input
                        type="datetime-local"
                        required
                        value={slot.startTime}
                        onChange={(e) => handleSlotChange(slot.id, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                        Thời gian kết thúc:
                      </span>
                      <input
                        type="datetime-local"
                        required
                        value={slot.endTime}
                        onChange={(e) => handleSlotChange(slot.id, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> Địa điểm (Offline):
                      </span>
                      <input
                        type="text"
                        placeholder="Ví dụ: Tầng 5, Tòa nhà FPT Tower..."
                        value={slot.location || ''}
                        onChange={(e) => handleSlotChange(slot.id, 'location', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-slate-400" /> Link Google Meet (Online):
                      </span>
                      <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={slot.meetingLink || ''}
                        onChange={(e) => handleSlotChange(slot.id, 'meetingLink', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
              className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold px-6"
            >
              Gửi Lịch Cho Ứng Viên
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
