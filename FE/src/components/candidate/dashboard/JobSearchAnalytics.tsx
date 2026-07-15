'use client'

import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { useGetJobSearchAnalytics } from '@/src/hooks/candidate/useGetJobSearchAnalytics'

export default function JobSearchAnalytics() {
  const [activeScope, setActiveScope] = useState<'week' | 'month' | 'year'>('week')
  const { data, isLoading } = useGetJobSearchAnalytics()

  if (isLoading) {
    return (
      <div className="mt-8 text-left bg-white rounded-3xl border border-slate-200/60 p-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2 w-full max-w-sm">
            <div className="h-5 w-48 bg-slate-200 rounded-md" />
            <div className="h-3 w-80 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 bg-slate-50/50 rounded-2xl p-5 border border-slate-100/60 h-67 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="h-3 w-32 bg-slate-200 rounded-md" />
              <div className="h-7 w-28 bg-slate-200 rounded-md" />
            </div>
            <div className="flex items-end justify-between h-40 pt-4 px-1 gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full max-w-7 bg-slate-200 rounded-t-md h-24" />
                  <div className="h-2 w-8 bg-slate-100 rounded-md" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1 bg-slate-50/50 rounded-2xl p-5 border border-slate-100/60 space-y-4 h-full">
            <div className="h-3 w-36 bg-slate-200 rounded-md mb-2" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-20 bg-slate-200 rounded-md" />
                    <div className="h-3 w-16 bg-slate-200 rounded-md" />
                  </div>
                  <div className="w-full bg-slate-150/80 rounded-full h-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const chartData =
    activeScope === 'week'
      ? data.weeklyData
      : activeScope === 'month'
        ? data.monthlyData
        : data.yearlyData

  const maxCount = Math.max(...chartData.map((d) => d.count), 0)
  const maxHeight = maxCount > 0 ? maxCount : 10

  return (
    <div className="mt-8 text-left bg-white rounded-3xl border border-slate-200/60 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-655" />
            Phân tích hành trình tìm việc
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Thống kê chi tiết tần suất hoạt động ứng tuyển và phễu chuyển đổi trạng thái của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left: Trend Chart (Takes 2/3 width) */}
        <div className="lg:col-span-2 bg-slate-50/50 rounded-2xl p-5 border border-slate-100/60 flex flex-col justify-between h-full min-h-67">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Tần suất ứng tuyển
            </h3>

            <select
              value={activeScope}
              onChange={(e) => setActiveScope(e.target.value as 'week' | 'month' | 'year')}
              className="bg-slate-50 border border-slate-200/80 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600 cursor-pointer transition-all active:scale-98"
            >
              <option value="week" className="normal-case font-bold text-xs">
                7 ngày gần nhất
              </option>
              <option value="month" className="normal-case font-bold text-xs">
                6 tháng gần nhất
              </option>
              <option value="year" className="normal-case font-bold text-xs">
                3 năm gần nhất
              </option>
            </select>
          </div>

          <div className="flex items-end justify-between h-40 pt-4 px-1 gap-1">
            {chartData.map((data, index) => {
              const percentHeight = maxHeight > 0 ? (data.count / maxHeight) * 100 : 0
              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-end h-full gap-1.5 flex-1 group"
                >
                  {/* Value Tooltip */}
                  <span className="text-[9px] font-black text-slate-700 bg-white border border-slate-200/50 px-1.5 py-0.5 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none select-none">
                    {data.count} đơn
                  </span>
                  {/* Bar Container */}
                  <div className="w-full flex items-end justify-center h-28">
                    <div
                      style={{ height: `${percentHeight}%` }}
                      className="w-full max-w-7 bg-linear-to-t from-blue-600 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-400 rounded-t-md transition-all duration-300 shadow-[0_2px_8px_rgba(37,99,235,0.06)] group-hover:shadow-[0_4px_12px_rgba(37,99,235,0.18)] min-h-1"
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
        </div>

        {/* Right: Application Funnel (Takes 1/3 width) */}
        <div className="lg:col-span-1 bg-slate-50/50 rounded-2xl p-5 border border-slate-100/60 space-y-4 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">
              Phễu trạng thái ứng tuyển
            </h3>
            <div className="space-y-4">
              {data.funnelData.map((item, index) => {
                const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-violet-650', 'bg-amber-500']
                const color = colors[index % colors.length]
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>{item.stage}</span>
                      <span className="font-black text-slate-800">
                        {item.count} đơn ({item.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-150/85 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
