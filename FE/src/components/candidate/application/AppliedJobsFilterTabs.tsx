'use client'

import React from 'react'

export type CandidateFilterStatus = 'ALL' | 'PENDING_SCHEDULE' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED'

interface AppliedJobsFilterTabsProps {
  activeTab: CandidateFilterStatus
  onTabChange: (tab: CandidateFilterStatus) => void
  counts: {
    all: number
    pendingSchedule: number
    interview: number
    accepted: number
    rejected: number
  }
}

export default function AppliedJobsFilterTabs({
  activeTab,
  onTabChange,
  counts,
}: AppliedJobsFilterTabsProps) {
  const tabs: { id: CandidateFilterStatus; label: string; count: number; colorClass: string }[] = [
    {
      id: 'ALL',
      label: 'Tất cả',
      count: counts.all,
      colorClass: activeTab === 'ALL' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    },
    {
      id: 'PENDING_SCHEDULE',
      label: 'Chờ chốt / Đổi lịch',
      count: counts.pendingSchedule,
      colorClass: activeTab === 'PENDING_SCHEDULE' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60',
    },
    {
      id: 'INTERVIEW',
      label: 'Lịch phỏng vấn',
      count: counts.interview,
      colorClass: activeTab === 'INTERVIEW' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60',
    },
    {
      id: 'ACCEPTED',
      label: 'Đã duyệt / Trúng tuyển',
      count: counts.accepted,
      colorClass: activeTab === 'ACCEPTED' ? 'bg-teal-600 text-white shadow-xs' : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/60',
    },
    {
      id: 'REJECTED',
      label: 'Đã từ chối',
      count: counts.rejected,
      colorClass: activeTab === 'REJECTED' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60',
    },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${tab.colorClass}`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  )
}
