'use client'

import { useState } from 'react'
import type { RecruiterAnalyticsResponse } from '@/src/types/company'

interface ApplicationAnalyticsChartProps {
  analytics?: RecruiterAnalyticsResponse
  isLoading?: boolean
}

type TimeRange = '7days' | '6months' | '3years'

const RANGES: { key: TimeRange; label: string }[] = [
  { key: '7days', label: '7 ngày gần nhất' },
  { key: '6months', label: '6 tháng gần nhất' },
  { key: '3years', label: '3 năm gần nhất' },
]

export default function ApplicationAnalyticsChart({
  analytics,
  isLoading,
}: ApplicationAnalyticsChartProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>('7days')

  // Pick the dataset for the active tab — no network call needed
  const chartData =
    activeRange === '7days'
      ? (analytics?.sevenDays ?? [])
      : activeRange === '3years'
        ? (analytics?.threeYears ?? [])
        : (analytics?.sixMonths ?? [])

  const maxChartHeight = Math.max(...chartData.map((d) => d.count), 1)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs text-left h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">Thống kê hồ sơ ứng tuyển</h2>
            <p className="text-xs font-bold text-slate-400">Số lượng hồ sơ nộp theo thời gian</p>
          </div>

          {/* Dropdown selector */}
          <select
            value={activeRange}
            onChange={(e) => setActiveRange(e.target.value as TimeRange)}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg outline-none cursor-pointer transition-colors"
          >
            {RANGES.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex items-end justify-between h-40 pt-4 px-1 gap-1">
            {chartData.map((data, index) => {
              const percentHeight = maxChartHeight > 0 ? (data.count / maxChartHeight) * 100 : 0
              const colors = ['bg-emerald-600', 'bg-emerald-500', 'bg-teal-500', 'bg-teal-400']
              const color = colors[index % colors.length]
              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-end h-full gap-1.5 flex-1 group"
                >
                  {/* Tooltip */}
                  <span className="text-[9px] font-black text-slate-700 bg-white border border-slate-200/50 px-1.5 py-0.5 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none select-none">
                    {data.count} đơn
                  </span>
                  {/* Bar */}
                  <div className="w-full flex items-end justify-center h-28">
                    <div
                      style={{ height: `${Math.max(percentHeight, data.count > 0 ? 4 : 2)}%` }}
                      className={`w-full max-w-7 ${color} group-hover:opacity-90 rounded-t-md transition-all duration-300 min-h-1`}
                    />
                  </div>
                  {/* Label */}
                  <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider text-center shrink-0">
                    {data.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
