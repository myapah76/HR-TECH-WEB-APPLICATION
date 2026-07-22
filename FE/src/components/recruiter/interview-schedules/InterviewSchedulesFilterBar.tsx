'use client'

import React from 'react'
import { CalendarClock, Filter, List } from 'lucide-react'
import SearchInput from '@/src/components/common/SearchInput'
import FilterSelect from '@/src/components/common/FilterSelect'
import { ApplicationStatus } from '@/src/types'
import { STATUS_CONFIG } from '@/src/components/recruiter/applications/ApplicationRow'

export type DateFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'no-date'
export type ViewMode = 'calendar' | 'list'

const INTERVIEW_STATUSES = [ApplicationStatus.INTERVIEW]

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả thời gian' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'upcoming', label: 'Sắp tới' },
  { value: 'overdue', label: 'Đã qua giờ' },
  { value: 'no-date', label: 'Chưa có thời gian' },
]

export interface InterviewSchedulesFilterBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  statusFilter: ApplicationStatus | ''
  onStatusFilterChange: (s: ApplicationStatus | '') => void
  dateFilter: DateFilter
  onDateFilterChange: (d: DateFilter) => void
  viewMode: ViewMode
  onViewModeChange: (m: ViewMode) => void
}

export default function InterviewSchedulesFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  viewMode,
  onViewModeChange,
}: InterviewSchedulesFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs">
      <div className="mb-3 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        {[
          { value: 'calendar' as const, label: 'Lịch', icon: CalendarClock },
          { value: 'list' as const, label: 'Danh sách', icon: List },
        ].map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onViewModeChange(mode.value)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition ${
              viewMode === mode.value
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <mode.icon className="h-4 w-4" />
            {mode.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Tìm theo candidate/CV hoặc vị trí..."
          className="flex-1"
        />

        <FilterSelect
          value={statusFilter}
          onChange={(v) => onStatusFilterChange(v as ApplicationStatus | '')}
          icon={Filter}
          placeholder="Tất cả trạng thái phỏng vấn"
          options={INTERVIEW_STATUSES.map((s) => ({ value: s, label: STATUS_CONFIG[s].label }))}
          className="lg:w-72"
        />

        <FilterSelect
          value={dateFilter}
          onChange={(v) => onDateFilterChange(v as DateFilter)}
          icon={CalendarClock}
          options={DATE_FILTER_OPTIONS}
          className="lg:w-56"
        />
      </div>
    </div>
  )
}
