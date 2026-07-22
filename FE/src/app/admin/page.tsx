'use client'

import { useState, useEffect } from 'react'
import StatCard from '@/src/components/ui/StatCard'
import { Users, Briefcase, Building2, Activity, Loader2, Coins, ClipboardList } from 'lucide-react'
import { getAdminDashboardSummary } from '@/src/services/admin-dashboard.service'
import { AdminDashboardSummary } from '@/src/types'

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMetric, setActiveMetric] = useState<'both' | 'revenue' | 'sales'>('both')
  const [activeTab, setActiveTab] = useState<'activities' | 'aiPackages'>('activities')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAdminDashboardSummary()
        setData(res)
      } catch (error) {
        console.error('Failed to fetch admin dashboard summary:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500 font-medium">
        Failed to load data
      </div>
    )
  }

  // Calculate coordinates for Left Area Chart (bleed edge / tràn viền và dóng hàng)
  const paddingLeft = 0
  const paddingRight = 0
  const paddingTop = 20
  const paddingBottom = 30
  const chartWidth = 500
  const chartHeight = 220
  const drawWidth = chartWidth - paddingLeft - paddingRight // 500
  const drawHeight = chartHeight - paddingTop - paddingBottom // 170

  const maxRevenue = Math.max(...(data.revenueHistory?.map((d) => d.revenue) || [0]), 0) || 1
  const maxSales = Math.max(...(data.revenueHistory?.map((d) => d.sales) || [0]), 0) || 1

  const pointsRevenue = data.revenueHistory?.map((d, i) => {
    const x = paddingLeft + i * (drawWidth / 5)
    const y = paddingTop + drawHeight - (d.revenue / maxRevenue) * drawHeight
    return { x, y, val: d.revenue, label: d.month }
  }) || []

  const pointsSales = data.revenueHistory?.map((d, i) => {
    const x = paddingLeft + i * (drawWidth / 5)
    const y = paddingTop + drawHeight - (d.sales / maxSales) * drawHeight
    return { x, y, val: d.sales, label: d.month }
  }) || []

  const linePathRevenue = pointsRevenue.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
  const areaPathRevenue = pointsRevenue.length > 0 
    ? `${linePathRevenue} L ${pointsRevenue[pointsRevenue.length - 1].x} ${paddingTop + drawHeight} L ${pointsRevenue[0].x} ${paddingTop + drawHeight} Z`
    : ''

  const linePathSales = pointsSales.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
  const areaPathSales = pointsSales.length > 0 
    ? `${linePathSales} L ${pointsSales[pointsSales.length - 1].x} ${paddingTop + drawHeight} L ${pointsSales[0].x} ${paddingTop + drawHeight} Z`
    : ''

  // Max calculations for Right Stacked Bar Chart (Weekly Profit)
  const maxDayRevenue = Math.max(...(data.weeklyProfit?.map((d) => d.revenue) || [0]), 0) || 1
  const maxDaySales = Math.max(...(data.weeklyProfit?.map((d) => d.sales) || [0]), 0) || 1

  return (
    <div>
      {/* 4-Column StatCards grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Tổng người dùng" value={data.totalUsers.toLocaleString()} change={0} color="blue" />
        <StatCard
          icon={Briefcase}
          label="Tin tuyển dụng"
          value={data.totalJobs.toLocaleString()}
          change={0}
          color="emerald"
        />
        <StatCard icon={Building2} label="Công ty" value={data.totalCompanies.toLocaleString()} change={0} color="violet" />
        <StatCard
          icon={ClipboardList}
          label="Việc cần làm hôm nay"
          value={`${(data.adminTodo?.pendingCompanies || 0) + (data.adminTodo?.pendingComplaints || 0)} việc`}
          changeLabel={`${data.adminTodo?.pendingCompanies || 0} c.ty chờ duyệt, ${data.adminTodo?.pendingComplaints || 0} khiếu nại`}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Card: System Stats & AI/Service Packages Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-3 flex-wrap">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Thống kê hệ thống
              </h2>
              {/* Tab Toggle Buttons */}
              <div className="flex gap-1 text-[11px] font-bold bg-slate-100 p-0.5 rounded-lg">
                <button 
                  onClick={() => setActiveTab('activities')}
                  className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'activities' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Hoạt động hôm nay
                </button>
                <button 
                  onClick={() => setActiveTab('aiPackages')}
                  className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'aiPackages' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Gói dịch vụ & AI
                </button>
              </div>
            </div>

            {activeTab === 'activities' ? (
              <div className="space-y-3">
                {[
                  { lv: 'Người dùng mới đăng ký', v: `+${data.systemActivities?.newUsersToday || 0} hôm nay` },
                  { lv: 'Tin tuyển đăng mới', v: `+${data.systemActivities?.newJobsToday || 0} hôm nay` },
                  { lv: 'Đơn ứng tuyển', v: `+${data.systemActivities?.applicationsToday || 0} hôm nay` },
                  { lv: 'Lượt quét CV', v: `+${data.systemActivities?.cvScansToday || 0} hôm nay` },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-700">{s.lv}</span>
                    <span className="text-xs font-bold text-emerald-600">{s.v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Popular Packages */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gói dịch vụ bán chạy</h3>
                  {data.topPackages?.map((pkg, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl hover:bg-slate-100/50 transition-colors">
                      <span className="truncate max-w-[120px]">{pkg.name}</span>
                      <span className="text-indigo-600 shrink-0">{pkg.salesCount} lượt mua</span>
                    </div>
                  ))}
                </div>

                {/* AI utilization */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tần suất sử dụng AI</h3>
                  {data.aiUsage?.map((ai, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl hover:bg-slate-100/50 transition-colors">
                      <span className="truncate max-w-[120px]">{ai.featureName}</span>
                      <span className="text-sky-500 shrink-0">{ai.usageCount} lượt dùng</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: User distribution breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs min-h-[300px]">
          <h2 className="text-base font-black text-slate-900 mb-4">Phân bổ người dùng</h2>
          <div className="space-y-3">
            {[
              { lv: 'Ứng viên', v: data.userDistribution?.candidates || 0, p: data.userDistribution?.candidatePercentage || 0, c: 'bg-blue-600' },
              { lv: 'Nhà tuyển dụng', v: data.userDistribution?.recruiters || 0, p: data.userDistribution?.recruiterPercentage || 0, c: 'bg-emerald-600' },
              { lv: 'Quản trị viên', v: data.userDistribution?.admins || 0, p: data.userDistribution?.adminPercentage || 0, c: 'bg-violet-600' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{s.lv}</span>
                  <span>
                    {s.v.toLocaleString()} ({s.p}%)
                  </span>
                </div>
                <div className="bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className={`${s.c} h-full rounded-full`} style={{ width: `${s.p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Chart Layout matching mockup */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        
        {/* Left Side: Double Line Area Chart (Revenue vs Sales) */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 pb-0 shadow-xs xl:col-span-2 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Coins className="h-5 w-5 text-indigo-600" />
                Tổng doanh thu & Giao dịch
              </h2>
              {/* Timeframe toggle */}
              <div className="bg-slate-100 p-0.5 rounded-lg flex text-[10px] font-bold text-slate-500">
                <button className="px-2.5 py-1 rounded-md hover:bg-white hover:shadow-xs transition-all">Ngày</button>
                <button className="px-2.5 py-1 rounded-md hover:bg-white hover:shadow-xs transition-all">Tuần</button>
                <button className="px-2.5 py-1 rounded-md bg-white shadow-xs text-slate-800">Tháng</button>
              </div>
            </div>

            {/* Legends & Custom Radio Selection */}
            <div className="flex items-center gap-6 mb-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                <input 
                  type="radio" 
                  name="metric" 
                  checked={activeMetric === 'both'} 
                  onChange={() => setActiveMetric('both')} 
                  className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" 
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  Cả hai
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                <input 
                  type="radio" 
                  name="metric" 
                  checked={activeMetric === 'revenue'} 
                  onChange={() => setActiveMetric('revenue')} 
                  className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" 
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  Doanh thu (VND)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                <input 
                  type="radio" 
                  name="metric" 
                  checked={activeMetric === 'sales'} 
                  onChange={() => setActiveMetric('sales')} 
                  className="text-sky-500 focus:ring-sky-400 h-3.5 w-3.5" 
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Số giao dịch
                </span>
              </label>
            </div>
          </div>

          {/* SVG Area Chart Container - aligned exactly with card margins */}
          <div className="relative h-[270px] w-full mt-4 mx-[-24px] px-6">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="gradientSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines - Streching edge to edge (0 to 500) */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingTop + drawHeight * ratio
                return (
                  <line 
                    key={i} 
                    x1={0} 
                    y1={y} 
                    x2={chartWidth} 
                    y2={y} 
                    stroke="#f1f5f9" 
                    strokeWidth="1"
                    strokeDasharray={ratio === 0.5 ? "4" : undefined}
                  />
                )
              })}

              {/* Area paths */}
              {activeMetric !== 'sales' && areaPathRevenue && (
                <path d={areaPathRevenue} fill="url(#gradientRevenue)" className="transition-all duration-300" />
              )}
              {activeMetric !== 'revenue' && areaPathSales && (
                <path d={areaPathSales} fill="url(#gradientSales)" className="transition-all duration-300" />
              )}

              {/* Line paths */}
              {activeMetric !== 'sales' && linePathRevenue && (
                <path d={linePathRevenue} fill="none" stroke="#4f46e5" strokeWidth="2.5" className="transition-all duration-300" />
              )}
              {activeMetric !== 'revenue' && linePathSales && (
                <path d={linePathSales} fill="none" stroke="#0ea5e9" strokeWidth="2.5" className="transition-all duration-300" />
              )}

              {/* Points for Revenue */}
              {activeMetric !== 'sales' && pointsRevenue.map((p, i) => (
                <g key={i} className="group/dot cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
                  <circle cx={p.x} cy={p.y} r="9" fill="#4f46e5" fillOpacity="0" className="hover:fill-opacity-15 transition-all" />
                  <title>{`Doanh thu ${p.label}: ${p.val.toLocaleString()}đ`}</title>
                </g>
              ))}

              {/* Points for Sales */}
              {activeMetric !== 'revenue' && pointsSales.map((p, i) => (
                <g key={i} className="group/dot cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#ffffff" stroke="#0ea5e9" strokeWidth="2.5" />
                  <circle cx={p.x} cy={p.y} r="9" fill="#0ea5e9" fillOpacity="0" className="hover:fill-opacity-15 transition-all" />
                  <title>{`Giao dịch ${p.label}: ${p.val}`}</title>
                </g>
              ))}

              {/* X Axis Labels */}
              {data.revenueHistory?.map((d, i) => {
                const x = paddingLeft + i * (drawWidth / 5)
                const y = paddingTop + drawHeight + 18
                return (
                  <text key={i} x={x} y={y} textAnchor="middle" className="text-[10px] font-bold fill-slate-400 select-none">
                    {d.month}
                  </text>
                )
              })}

              {/* Y Axis Labels overlayed at the left edge (x=0) align perfectly with option buttons */}
              {[1, 0.75, 0.5, 0.25, 0].map((ratio, i) => {
                const y = paddingTop + drawHeight * (1 - ratio)
                let valStr = ""
                if (activeMetric === 'sales') {
                  valStr = Math.round(maxSales * ratio).toString()
                } else {
                  const val = maxRevenue * ratio
                  if (val >= 1000000) valStr = (val / 1000000).toFixed(1) + "Mđ"
                  else if (val >= 1000) valStr = (val / 1000).toFixed(0) + "Kđ"
                  else valStr = val.toString() + "đ"
                }
                return (
                  <text 
                    key={i} 
                    x={0} 
                    y={y - 5} 
                    textAnchor="start" 
                    className="text-[9px] font-bold fill-slate-400 select-none"
                  >
                    {valStr}
                  </text>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Right Side: Stacked Bar Chart (Weekly Profit) */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs xl:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-base font-black text-slate-900">
                Doanh số tuần này
              </h2>
              {/* Dropdown Selector */}
              <div className="relative">
                <select className="text-[10px] font-bold text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-slate-50">
                  <option>Tuần này</option>
                  <option>Tuần trước</option>
                </select>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="flex items-center gap-4 mb-8">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                Giao dịch
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                Doanh thu
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="flex gap-2 items-end h-[270px] w-full pt-4 select-none">
            
            {/* Y Axis Labels (Left Side) */}
            <div className="flex flex-col justify-between h-full text-[9px] font-bold text-slate-400 text-right w-10 pb-6 pr-2 select-none">
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>

            {/* Chart Body */}
            <div className="flex-1 h-full flex items-end justify-between gap-2 border-l border-b border-slate-100 relative pb-6 px-1">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                <div className="border-t border-slate-100/60 w-full" />
                <div className="border-t border-slate-100/60 w-full" />
                <div className="border-t border-slate-100/60 w-full" />
                <div className="border-t border-slate-100/60 w-full" />
                <div className="border-t border-slate-100/60 w-full" />
                <div className="w-full" />
              </div>

              {data.weeklyProfit?.map((item, index) => {
                // Stacked logic normalized to max values
                const salesPct = maxDaySales > 0 ? (item.sales / maxDaySales) * 35 : 0
                const revenuePct = maxDayRevenue > 0 ? (item.revenue / maxDayRevenue) * 55 : 0
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end z-10">
                    
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      <div className="text-sky-300">Doanh thu: {item.revenue.toLocaleString()}đ</div>
                      <div className="text-indigo-300">Giao dịch: {item.sales}</div>
                    </div>

                    {/* Stacked Column */}
                    <div className="w-full max-w-[20px] flex flex-col justify-end h-full relative cursor-pointer gap-[2px]">
                      {/* Top Stack: Revenue (Light Blue) */}
                      {revenuePct > 0 && (
                        <div 
                          className="w-full bg-sky-400 rounded-t-xs"
                          style={{ height: `${revenuePct}%` }}
                        />
                      )}
                      {/* Bottom Stack: Sales (Dark Blue) */}
                      {salesPct > 0 && (
                        <div 
                          className={`w-full bg-indigo-600 ${revenuePct > 0 ? 'rounded-b-xs' : 'rounded-xs'}`}
                          style={{ height: `${salesPct}%` }}
                        />
                      )}
                    </div>
                    {/* X Axis Label */}
                    <span className="absolute top-[252px] text-[10px] font-bold text-slate-400">{item.day}</span>
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
