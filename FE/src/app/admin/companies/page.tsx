'use client'

import PageHeader from '@/src/components/ui/PageHeader'
import Badge from '@/src/components/ui/Badge'
import { Building2, CheckCircle, XCircle } from 'lucide-react'

const COMPANIES = [
  {
    id: 'c1',
    name: 'FPT Software',
    logo: 'FPT',
    logoBg: 'bg-orange-500',
    industry: 'Công nghệ thông tin',
    openPositions: 156,
  },
  {
    id: 'c2',
    name: 'VNG Corporation',
    logo: 'VNG',
    logoBg: 'bg-blue-600',
    industry: 'Internet & Game',
    openPositions: 89,
  },
  {
    id: 'c3',
    name: 'Viettel Digital',
    logo: 'VTD',
    logoBg: 'bg-red-600',
    industry: 'Viễn thông & Số hóa',
    openPositions: 72,
  },
  {
    id: 'c4',
    name: 'Tiki Corporation',
    logo: 'TK',
    logoBg: 'bg-blue-500',
    industry: 'Thương mại điện tử',
    openPositions: 45,
  },
  {
    id: 'c5',
    name: 'Momo Fintech',
    logo: 'MM',
    logoBg: 'bg-pink-600',
    industry: 'Fintech',
    openPositions: 34,
  },
  {
    id: 'c6',
    name: 'NashTech Global',
    logo: 'NT',
    logoBg: 'bg-indigo-600',
    industry: 'Outsourcing',
    openPositions: 67,
  },
]

export default function CompaniesPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader
        icon={Building2}
        title="Quản lý công ty"
        subtitle="Xác minh và quản lý hồ sơ doanh nghiệp tuyển dụng"
      />
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <th className="p-4">Công ty</th>
              <th className="p-4">Ngành</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {COMPANIES.map((c, i) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-lg text-white font-bold text-xs flex items-center justify-center ${c.logoBg}`}
                    >
                      {c.logo}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {c.openPositions} vị trí tuyển
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-xs font-bold text-slate-600">{c.industry}</td>
                <td className="p-4">
                  <Badge variant={i < 5 ? 'success' : 'warning'} size="md">
                    {i < 5 ? 'Đã xác minh' : 'Chờ xác minh'}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
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
