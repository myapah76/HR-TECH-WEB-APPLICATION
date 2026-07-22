'use client'

import React from 'react'
import { ArrowLeft, Sparkles, ChevronUp, ChevronDown } from 'lucide-react'

interface JobInterviewsHeaderProps {
  onBack: () => void
  showRoundsBox: boolean
  onToggleRoundsBox: () => void
}

export default function JobInterviewsHeader({
  onBack,
  showRoundsBox,
  onToggleRoundsBox,
}: JobInterviewsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer"
          title="Quay lại danh sách tin tuyển dụng"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Quản Lý Quy Trình Phỏng Vấn
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lên lịch nhiều slot giờ, tự động điều phối ứng viên & đánh giá kết quả nâng vòng
          </p>
        </div>
      </div>

      {/* Top Right: Toggle Button */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleRoundsBox}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{showRoundsBox ? 'Ẩn Quy Trình Vòng' : 'Xem Quy Trình Vòng'}</span>
          {showRoundsBox ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}
