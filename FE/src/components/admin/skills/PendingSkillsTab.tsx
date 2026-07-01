import React, { useState } from 'react'
import { Search, CheckCircle, XCircle } from 'lucide-react'
import { Skill } from '@/src/types/skill'

interface PendingSkillsTabProps {
  pendingSkills: Skill[]
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

const PendingSkillsTab = ({ pendingSkills, onApprove, onReject }: PendingSkillsTabProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = pendingSkills.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-slate-800">
          Danh sách Kỹ năng Chờ Duyệt
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm kỹ năng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-72 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-violet-500"
          />
        </div>
      </div>

      <div className="border border-slate-100 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4">Tên kỹ năng</th>
              <th className="px-6 py-4">Mô tả</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.map((skill) => (
              <tr key={skill.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800 capitalize">
                  {skill.name}
                </td>
                <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                  {skill.description || <span className="italic text-slate-300">Không có mô tả</span>}
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {skill.createdAt ? new Date(skill.createdAt).toLocaleDateString('vi-VN') : 'Unknown'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onApprove(skill.id)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
                    >
                      <CheckCircle className="h-4 w-4" />
                      DUYỆT
                    </button>
                    <button
                      onClick={() => onReject(skill.id)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
                    >
                      <XCircle className="h-4 w-4" />
                      BỎ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400 font-medium">
                  Không có kỹ năng nào chờ kiểm duyệt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default React.memo(PendingSkillsTab)
