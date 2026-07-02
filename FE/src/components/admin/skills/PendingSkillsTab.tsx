import React, { useState, useEffect } from 'react'
import { Search, CheckCircle, XCircle, CheckCheck, Loader2 } from 'lucide-react'
import { Skill } from '@/src/types/skill'
import Pagination from './Pagination'

interface PendingSkillsTabProps {
  pendingSkills: Skill[]
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
}

const PendingSkillsTab = ({ pendingSkills, onApprove, onReject }: PendingSkillsTabProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isApprovingAll, setIsApprovingAll] = useState(false)

  const filtered = pendingSkills.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  const paginatedSkills = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleApproveAll = async () => {
    if (filtered.length === 0) return
    if (!confirm(`Bạn có chắc chắn muốn duyệt tất cả ${filtered.length} kỹ năng này không?`)) return

    setIsApprovingAll(true)
    try {
      for (const skill of filtered) {
        await onApprove(skill.id)
      }
    } finally {
      setIsApprovingAll(false)
    }
  }

  return (
    <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col min-h-0 overflow-hidden">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 shrink-0">
        <div>
          <h2 className="text-lg font-black text-slate-800">
            Danh sách Kỹ năng Chờ Duyệt
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Tổng cộng: {pendingSkills.length} kỹ năng đang chờ kiểm duyệt
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm kỹ năng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-64 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-violet-500 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleApproveAll}
            disabled={isApprovingAll || filtered.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs shrink-0"
          >
            {isApprovingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            {isApprovingAll ? 'Đang duyệt...' : 'Duyệt tất cả'}
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 border border-slate-100 rounded-2xl overflow-y-auto min-h-0">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4">Tên kỹ năng</th>
              <th className="px-6 py-4">Mô tả</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedSkills.map((skill) => (
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
                <td colSpan={4} className="text-center py-12 text-slate-400 font-medium">
                  Không có kỹ năng nào chờ kiểm duyệt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  )
}

export default React.memo(PendingSkillsTab)
