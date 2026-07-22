'use client'

import React from 'react'
import { Search } from 'lucide-react'

export type InterviewStatusTab = 'ALL' | 'NOT_STARTED' | 'SLOTS_SENT' | 'CONFIRMED' | 'PASSED' | 'FAILED'

interface InterviewStatusFilterTabsProps {
  activeTab: InterviewStatusTab
  onTabChange: (tab: InterviewStatusTab) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isApprovalStep?: boolean
  counts: {
    total: number
    notStarted: number
    slotsSent: number
    confirmed: number
    passed: number
    failed: number
  }
}

export default function InterviewStatusFilterTabs({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  isApprovalStep = false,
  counts,
}: InterviewStatusFilterTabsProps) {
  const tabs = [
    {
      id: 'ALL' as InterviewStatusTab,
      label: `Tất cả (${counts.total})`,
      activeColor: 'bg-emerald-600 text-white shadow-xs',
      inactiveColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200',
    },
    {
      id: 'NOT_STARTED' as InterviewStatusTab,
      label: `Chưa xếp lịch (${counts.notStarted})`,
      activeColor: 'bg-amber-600 text-white shadow-xs',
      inactiveColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100',
    },
    {
      id: 'SLOTS_SENT' as InterviewStatusTab,
      label: `Đã gửi lịch (${counts.slotsSent})`,
      activeColor: 'bg-teal-600 text-white shadow-xs',
      inactiveColor: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100',
    },
    {
      id: 'CONFIRMED' as InterviewStatusTab,
      label: `Đã chốt lịch (${counts.confirmed})`,
      activeColor: 'bg-emerald-600 text-white shadow-xs',
      inactiveColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100',
    },
    {
      id: 'PASSED' as InterviewStatusTab,
      label: `Đạt qua vòng (${counts.passed})`,
      activeColor: 'bg-blue-600 text-white shadow-xs',
      inactiveColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100',
    },
    {
      id: 'FAILED' as InterviewStatusTab,
      label: `Loại / Trượt (${counts.failed})`,
      activeColor: 'bg-rose-600 text-white shadow-xs',
      inactiveColor: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100',
    },
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      {isApprovalStep ? (
        /* Bên trái ở tab Duyệt Tuyển Dụng: Hiện tổng số ứng viên thay thế cho các tabs status */
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3.5 py-2 rounded-xl text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs">
            Tổng số: {counts.total} ứng viên
          </span>
          {counts.passed > 0 && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Đã duyệt: {counts.passed}
            </span>
          )}
          {counts.failed > 0 && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Từ chối: {counts.failed}
            </span>
          )}
        </div>
      ) : (
        /* Filter tabs cho các vòng phỏng vấn */
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? tab.activeColor : tab.inactiveColor
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Search Input Box */}
      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm tên ứng viên, vị trí..."
          className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-emerald-500 transition-all shadow-2xs"
        />
      </div>
    </div>
  )
}
