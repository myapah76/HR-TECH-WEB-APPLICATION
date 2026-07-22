'use client'

import React, { useState, useMemo } from 'react'
import { FileText, Sparkles, Loader2, Trash2, ShieldAlert, CheckCircle2, CheckSquare } from 'lucide-react'
import { ApplicationStatus, ApplicationSummaryResponse } from '@/src/types'
import Pagination from '@/src/components/common/Pagination'
import { formatDate } from '@/src/utils'

interface JobApplicationsTableProps {
  applications: ApplicationSummaryResponse[]
  isLoading: boolean
  thresholdPercent: number
  onViewCv: (applicationId: string) => void
  currentPage?: number
  totalPages?: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange?: (page: number) => void
  onItemsPerPageChange?: (size: number) => void
  // Bulk selection props
  showCheckboxes?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
}

export default function JobApplicationsTable({
  applications,
  isLoading,
  thresholdPercent,
  onViewCv,
  currentPage: propPage,
  totalPages: propTotalPages,
  totalItems: propTotalItems,
  itemsPerPage: propItemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showCheckboxes = true,
  selectedIds,
  onSelectionChange,
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

  // Checkbox helpers
  const currentIds = useMemo(
    () => new Set(paginatedApplications.map((a) => a.id)),
    [paginatedApplications]
  )
  const allCurrentSelected = useMemo(
    () =>
      currentIds.size > 0 &&
      [...currentIds].every((id) => selectedIds?.has(id)),
    [currentIds, selectedIds]
  )
  const someCurrentSelected = useMemo(
    () => [...currentIds].some((id) => selectedIds?.has(id)),
    [currentIds, selectedIds]
  )

  // Count below threshold items in whole list
  const belowThresholdCount = useMemo(() => {
    return applications.filter(
      (a) =>
        a.overallScore !== undefined &&
        a.overallScore !== null &&
        a.overallScore < thresholdPercent &&
        a.status !== ApplicationStatus.REJECTED
    ).length
  }, [applications, thresholdPercent])

  const handleSelectAll = () => {
    if (!onSelectionChange || !selectedIds) return
    const next = new Set(selectedIds)
    if (allCurrentSelected) {
      currentIds.forEach((id) => next.delete(id))
    } else {
      currentIds.forEach((id) => next.add(id))
    }
    onSelectionChange(next)
  }

  const handleSelectAllBelowThreshold = () => {
    if (!onSelectionChange || !selectedIds) return
    const next = new Set(selectedIds)
    applications.forEach((a) => {
      if (
        a.overallScore !== undefined &&
        a.overallScore !== null &&
        a.overallScore < thresholdPercent &&
        a.status !== ApplicationStatus.REJECTED
      ) {
        next.add(a.id)
      }
    })
    onSelectionChange(next)
  }

  const handleToggleOne = (id: string) => {
    if (!onSelectionChange || !selectedIds) return
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-900 shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
          Đang tải danh sách đơn ứng tuyển...
        </span>
      </div>
    )
  }

  if (activeTotalItems === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-dashed border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-12 text-center text-slate-500 text-xs font-semibold">
        Chưa có đơn ứng tuyển nào trong danh sách này.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Dynamic Filter Info Bar */}
      {belowThresholdCount > 0 && showCheckboxes && (
        <div className="flex items-center justify-between gap-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-xl px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Phát hiện <strong className="font-black text-amber-900 dark:text-amber-200">{belowThresholdCount}</strong> ứng viên có điểm &lt; <strong className="font-black">{thresholdPercent}%</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleSelectAllBelowThreshold}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Chọn tất cả {belowThresholdCount} đơn dưới ngưỡng
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                {showCheckboxes && (
                  <th className="px-4 py-3.5 text-center w-10">
                    <input
                      type="checkbox"
                      checked={allCurrentSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someCurrentSelected && !allCurrentSelected
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 accent-emerald-600 cursor-pointer"
                      title="Chọn tất cả trên trang này"
                    />
                  </th>
                )}
                <th className="px-4 py-3.5 text-center w-12">STT</th>
                <th className="px-5 py-3.5">Ứng viên & CV</th>
                <th className="px-4 py-3.5 text-center">Trạng thái đơn</th>
                <th className="px-4 py-3.5 text-center">Điểm AI Match</th>
                <th className="px-4 py-3.5 text-center">Trạng thái ngưỡng</th>
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
                const isSelected = selectedIds?.has(app.id) ?? false

                // Dynamic Threshold calculation
                const isScored = score !== undefined && score !== null
                const isBelowThreshold = isScored && score < thresholdPercent

                return (
                  <tr
                    key={app.id}
                    className={`transition-all ${
                      isRejected
                        ? 'opacity-40 bg-slate-100/60 dark:bg-slate-800/40 line-through'
                        : isBelowThreshold
                        ? 'opacity-60 grayscale-[50%] bg-amber-50/20 dark:bg-amber-950/10 border-l-4 border-l-amber-400 hover:opacity-85'
                        : isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-l-4 border-l-emerald-500'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {showCheckboxes && (
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleOne(app.id)}
                          disabled={isRejected}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 accent-emerald-600 cursor-pointer disabled:opacity-40"
                        />
                      </td>
                    )}
                    <td className="px-4 py-4 text-center font-bold text-slate-400">
                      {globalIndex}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {app.candidateName || 'Ứng viên'}
                      </div>
                      {app.cvTitle && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>{app.cvTitle}</span>
                        </div>
                      )}
                    </td>

                    {/* Trạng thái đơn Application Status */}
                    <td className="px-4 py-4 text-center">
                      {app.status === ApplicationStatus.ACCEPTED ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Đã duyệt CV
                        </span>
                      ) : app.status === ApplicationStatus.REJECTED ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          Đã từ chối
                        </span>
                      ) : app.status === ApplicationStatus.PENDING_INTERVIEW_SCHEDULE ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
                          Chờ phỏng vấn
                        </span>
                      ) : app.status === ApplicationStatus.SCORED ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg">
                          Đã chấm AI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                          Mới nộp
                        </span>
                      )}
                    </td>

                    {/* AI Score Badge */}
                    <td className="px-4 py-4 text-center">
                      {isScored ? (
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs border ${
                            score >= 80
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : score >= thresholdPercent
                              ? 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{score.toFixed(1)}%</span>
                          {grade && <span className="opacity-75">({grade})</span>}
                        </div>
                      ) : (
                        <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                          Chưa sàng lọc AI
                        </span>
                      )}
                    </td>

                    {/* Dynamic Threshold Status */}
                    <td className="px-4 py-4 text-center">
                      {isScored && !isRejected ? (
                        isBelowThreshold ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-100/70 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 rounded-lg">
                            <ShieldAlert className="w-3 h-3" />
                            Dưới ngưỡng (&lt;{thresholdPercent}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 rounded-lg">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đạt ngưỡng (≥{thresholdPercent}%)
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-slate-500 font-medium">
                      {app.appliedAt ? formatDate(app.appliedAt) : 'Chưa có'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewCv(app.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
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
