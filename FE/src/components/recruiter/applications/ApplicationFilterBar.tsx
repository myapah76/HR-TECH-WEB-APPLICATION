'use client'

import React from 'react'
import { Search, Trash2 } from 'lucide-react'
import { ApplicationStatus } from '@/src/types'

type StatusFilterType = 'ALL' | 'SUBMITTED' | 'SCORED' | 'FINAL_ACCEPTED' | 'INTERVIEW' | 'CV_REJECTED'

interface ApplicationFilterBarProps {
  statusFilter: StatusFilterType
  onStatusFilterChange: (filter: StatusFilterType) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCount: number
  onBulkReject: () => void
  counts: {
    total: number
    submitted: number
    scored: number
    accepted: number
    interview: number
    rejected: number
  }
}

export default function ApplicationFilterBar({
  statusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchChange,
  selectedCount,
  onBulkReject,
  counts,
}: ApplicationFilterBarProps) {
  const tabs: { id: StatusFilterType; label: string; count: number; activeColor: string; inactiveColor: string }[] = [
    {
      id: 'ALL',
      label: 'Tất cả',
      count: counts.total,
      activeColor: 'bg-emerald-600 text-white shadow-xs',
      inactiveColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200',
    },
    {
      id: 'SUBMITTED',
      label: 'Mới nộp',
      count: counts.submitted,
      activeColor: 'bg-amber-600 text-white shadow-xs',
      inactiveColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100',
    },
    {
      id: 'SCORED',
      label: 'Đã chấm AI',
      count: counts.scored,
      activeColor: 'bg-teal-600 text-white shadow-xs',
      inactiveColor: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100',
    },
    {
      id: 'FINAL_ACCEPTED',
      label: 'Đã trúng tuyển',
      count: counts.accepted,
      activeColor: 'bg-emerald-600 text-white shadow-xs',
      inactiveColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100',
    },
    {
      id: 'INTERVIEW',
      label: 'Đang phỏng vấn',
      count: counts.interview,
      activeColor: 'bg-blue-600 text-white shadow-xs',
      inactiveColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100',
    },
    {
      id: 'CV_REJECTED',
      label: 'Đã từ chối',
      count: counts.rejected,
      activeColor: 'bg-rose-600 text-white shadow-xs',
      inactiveColor: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100',
    },
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onStatusFilterChange(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === tab.id ? tab.activeColor : tab.inactiveColor
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search & Bulk Reject Button */}
      <div className="flex items-center gap-3 flex-1 min-w-56 justify-end">
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên ứng viên, tên CV..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-xl px-3 py-1.5 shrink-0">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-200">
              Đã chọn <strong>{selectedCount}</strong>
            </span>
            <button
              type="button"
              onClick={onBulkReject}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Từ chối
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
