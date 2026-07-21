'use client'

import React from 'react'
import { Calendar } from 'lucide-react'

interface InterviewsBulkActionBarProps {
  selectedCount: number
  onCreateGroupSchedule: () => void
  onClearSelection: () => void
}

export default function InterviewsBulkActionBar({
  selectedCount,
  onCreateGroupSchedule,
  onClearSelection,
}: InterviewsBulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-4 py-2.5 rounded-xl shadow-xs">
      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
        Đã chọn <strong className="font-black text-emerald-600">{selectedCount}</strong> ứng viên
      </span>
      <button
        type="button"
        onClick={onCreateGroupSchedule}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>Tạo lịch phỏng vấn nhóm ({selectedCount} ứng viên)</span>
      </button>
      <button
        type="button"
        onClick={onClearSelection}
        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 underline cursor-pointer"
      >
        Bỏ chọn
      </button>
    </div>
  )
}
