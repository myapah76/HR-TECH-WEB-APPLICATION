'use client'

import React, { useState, useMemo } from 'react'
import { FileText, Sparkles, Loader2 } from 'lucide-react'
import { ApplicationStatus, ApplicationSummaryResponse } from '@/src/types'
import Pagination from '@/src/components/common/Pagination'
import { formatDate } from '@/src/utils'

interface JobApplicationsTableProps {
  applications: ApplicationSummaryResponse[]
  isLoading: boolean
  onViewCv: (applicationId: string) => void
  currentPage?: number
  totalPages?: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange?: (page: number) => void
  onItemsPerPageChange?: (size: number) => void
}

export default function JobApplicationsTable({
  applications,
  isLoading,
  onViewCv,
  currentPage: propPage,
  totalPages: propTotalPages,
  totalItems: propTotalItems,
  itemsPerPage: propItemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: JobApplicationsTableProps) {
  const [internalPage, setInternalPage] = useState(1)
  const [internalItemsPerPage, setInternalItemsPerPage] = useState(10)

  const isControlled = Boolean(onPageChange)

  const activePage = isControlled ? (propPage ?? 1) : internalPage
  const activeItemsPerPage = isControlled ? (propItemsPerPage ?? 10) : internalItemsPerPage
  const activeTotalItems = isControlled
    ? (propTotalItems ?? applications.length)
    : applications.length
  const activeTotalPages = isControlled
    ? (propTotalPages ?? (Math.ceil(activeTotalItems / activeItemsPerPage) || 1))
    : Math.ceil(activeTotalItems / activeItemsPerPage) || 1

  const paginatedApplications = useMemo(() => {
    if (isControlled) {
      return applications
    }
    const start = (activePage - 1) * activeItemsPerPage
    return applications.slice(start, start + activeItemsPerPage)
  }, [applications, activePage, activeItemsPerPage, isControlled])

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
        <span className="text-xs font-bold text-slate-500">
          Đang tải danh sách đơn ứng tuyển...
        </span>
      </div>
    )
  }

  if (activeTotalItems === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
        Chưa có đơn ứng tuyển nào mới.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 text-[11px] font-black uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3.5 text-center w-12">STT</th>
                <th className="px-5 py-3.5">Ứng viên</th>
                <th className="px-4 py-3.5 text-center">Điểm AI Match Score</th>
                <th className="px-4 py-3.5">Ngày nộp</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedApplications.map((app, index) => {
                const globalIndex = (activePage - 1) * activeItemsPerPage + index + 1
                const score = app.overallScore
                const grade = app.grade
                const isRejected = app.status === ApplicationStatus.REJECTED

                return (
                  <tr
                    key={app.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                      isRejected ? 'opacity-60 bg-red-50/20' : ''
                    }`}
                  >
                    <td className="px-4 py-4 text-center font-bold text-slate-400">
                      {globalIndex}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {app.candidateName || 'Ứng viên'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {score !== undefined && score !== null ? (
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs border ${
                            score >= 80
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : score >= 60
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{score.toFixed(1)}%</span>
                          {grade && <span className="opacity-75">({grade})</span>}
                        </div>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                          Chưa sàng lọc AI (N/A)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-500 font-medium">
                      {app.appliedAt ? formatDate(app.appliedAt) : 'Chưa có'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewCv(app.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Xem CV
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={activePage}
        totalPages={activeTotalPages}
        totalItems={activeTotalItems}
        itemsPerPage={activeItemsPerPage}
        onPageChange={(p) => {
          if (isControlled && onPageChange) onPageChange(p)
          else setInternalPage(p)
        }}
        onItemsPerPageChange={(s) => {
          if (isControlled && onItemsPerPageChange) onItemsPerPageChange(s)
          else {
            setInternalItemsPerPage(s)
            setInternalPage(1)
          }
        }}
      />
    </div>
  )
}
