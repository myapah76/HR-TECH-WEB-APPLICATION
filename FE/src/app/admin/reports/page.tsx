'use client'

import PageHeader from '@/src/components/ui/PageHeader'
import { FileBarChart, Download } from 'lucide-react'

export default function ReportsPage() {
  const reports = [
    { nv: 'Báo cáo tăng trưởng người dùng', d: '2026-05' },
    { nv: 'Phân tích tuyển dụng', d: '2026-05' },
    { nv: 'Báo cáo doanh thu', d: '2026-Q1' },
    { nv: 'Hiệu suất hệ thống', d: '2026-05' },
  ]

  return (
    <div className="max-w-4xl">
      <PageHeader
        icon={FileBarChart}
        title="Báo cáo hệ thống"
        subtitle="Tải xuống và xem các báo cáo tổng hợp dữ liệu"
      />
      <div className="space-y-3">
        {reports.map((r, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs flex items-center justify-between hover:border-blue-200 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="bg-violet-50 p-2.5 rounded-xl">
                <FileBarChart className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-800">{r.nv}</p>
                <p className="text-[10px] font-bold text-slate-400">{r.d}</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-colors">
              <Download className="h-3.5 w-3.5" />
              Tải xuống
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
