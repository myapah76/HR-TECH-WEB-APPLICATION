'use client'

import PageHeader from '@/src/components/ui/PageHeader'
import Badge from '@/src/components/ui/Badge'
import { Briefcase, CheckCircle, XCircle, Eye } from 'lucide-react'
import { INITIAL_JOBS } from '@/src/data'

export default function JobsManagementPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader
        icon={Briefcase}
        title="Quản lý tin tuyển dụng"
        subtitle="Duyệt và quản lý tin đăng tuyển trên hệ thống"
      />
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <th className="p-4">Vị trí</th>
              <th className="p-4">Công ty</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {INITIAL_JOBS.slice(0, 6).map((j, i) => (
              <tr key={j.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-4">
                  <p className="text-xs font-extrabold text-slate-800">{j.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {j.salary} • {j.location}
                  </p>
                </td>
                <td className="p-4 text-xs font-bold text-slate-600">{j.company}</td>
                <td className="p-4">
                  <Badge
                    variant={i < 4 ? 'success' : i === 4 ? 'warning' : 'danger'}
                    size="md"
                  >
                    {i < 4 ? 'Đã duyệt' : i === 4 ? 'Chờ duyệt' : 'Từ chối'}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1.5 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer">
                      <CheckCircle className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer">
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
