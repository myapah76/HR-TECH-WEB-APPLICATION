'use client'

import { BarChart3 } from 'lucide-react'

interface FunnelItem {
  stage: string
  count: number
  percent: number
  color: string
}

interface ChartItem {
  month: string
  count: number
}

interface JobSearchAnalyticsProps {
  funnelData: FunnelItem[]
  chartData: ChartItem[]
}

export default function JobSearchAnalytics({ funnelData, chartData }: JobSearchAnalyticsProps) {
  return (
    <div className="mt-8 text-left bg-white rounded-3xl border border-slate-200/60 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Phân tích hành trình tìm việc
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Thống kê chi tiết phễu chuyển đổi và xu hướng nộp hồ sơ của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left: Application Funnel */}
        <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/60 space-y-4 h-full">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            Phễu trạng thái ứng tuyển
          </h3>
          <div className="space-y-4">
            {funnelData.map((item, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>{item.stage}</span>
                  <span className="font-black text-slate-800">
                    {item.count} đơn ({item.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800/40 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Monthly Trend Chart */}
        <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/60 flex flex-col justify-between h-full min-h-67">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
            Tần suất ứng tuyển theo tháng
          </h3>

          <div className="flex items-end justify-between h-40 pt-4 px-2">
            {chartData.map((data, index) => {
              const maxHeight = 12 // Maximum count in chartData
              const percentHeight = (data.count / maxHeight) * 100
              return (
                <div key={index} className="flex flex-col items-center gap-1.5 flex-1 group">
                  {/* Value Tooltip */}
                  <span className="text-[9px] font-black text-slate-700 bg-white border border-slate-200/50 px-1.5 py-0.5 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none select-none">
                    {data.count} đơn
                  </span>
                  {/* Bar */}
                  <div
                    style={{ height: `${percentHeight}%` }}
                    className="w-7 bg-linear-to-t from-blue-600 to-indigo-650 group-hover:from-blue-500 group-hover:to-indigo-550 rounded-t-md transition-all duration-300 shadow-[0_2px_8px_rgba(37,99,235,0.1)] group-hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)] min-h-1.5"
                  />
                  {/* Label */}
                  <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                    {data.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
