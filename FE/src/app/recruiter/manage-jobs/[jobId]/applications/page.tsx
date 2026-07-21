'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Search, Calendar, Trash2, CheckSquare, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import BulkAiScoringBar from '@/src/components/recruiter/applications/BulkAiScoringBar'
import ApplicationDetailModal from '@/src/components/recruiter/applications/ApplicationDetailModal'
import JobApplicationsTable from '@/src/components/recruiter/applications/JobApplicationsTable'
import RejectSelectedModal from '@/src/components/recruiter/applications/RejectSelectedModal'
import { ApplicationStatus, ApplicationSummaryResponse } from '@/src/types'
import {
  useGetApplicationsByJob,
  useAcceptApplication,
  useRejectApplication,
  useBulkScoreByJob,
  useBulkRejectApplications,
} from '@/src/hooks/application'
import { useGetMyCompany } from '@/src/hooks/company'

export default function JobApplicationsPage() {
  const params = useParams()
  const jobId = (params?.jobId as string) || ''

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: myCompany } = useGetMyCompany()
  const { data: pageData, isLoading } = useGetApplicationsByJob(
    jobId,
    currentPage - 1,
    itemsPerPage,
    undefined
  )
  const apiApplications: ApplicationSummaryResponse[] = pageData?.content ?? []

  // Local state mirror
  const [localApplications, setLocalApplications] = useState<ApplicationSummaryResponse[]>([])
  useEffect(() => {
    if (pageData?.content) {
      setLocalApplications(pageData.content)
    }
  }, [pageData?.content])

  const { mutate: acceptApp } = useAcceptApplication()
  const { mutate: rejectApp } = useRejectApplication()
  const { mutate: bulkScore, isPending: isScoringBulk } = useBulkScoreByJob(jobId)
  const { mutate: bulkReject, isPending: isRejecting } = useBulkRejectApplications(jobId)

  // Interactive States
  const [hasScoredLocal, setHasScoredLocal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [thresholdPercent, setThresholdPercent] = useState<number>(60)

  // Automatically detect if any application has already been scored
  const isAnyScored = useMemo(
    () => localApplications.some((app) => app.overallScore !== undefined && app.overallScore !== null),
    [localApplications]
  )

  // Count unscored (chưa có overallScore)
  const unscoredCount = useMemo(
    () => localApplications.filter((app) => app.overallScore === undefined || app.overallScore === null).length,
    [localApplications]
  )

  // Sort & filter
  const processedApplications = useMemo(() => {
    let list = [...localApplications]

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter(
        (app) =>
          (app.candidateName && app.candidateName.toLowerCase().includes(q)) ||
          (app.cvTitle && app.cvTitle.toLowerCase().includes(q))
      )
    }

    if (hasScoredLocal || isAnyScored) {
      // Sau khi chấm: sort theo điểm cao → thấp
      list.sort((a, b) => (b.overallScore ?? -1) - (a.overallScore ?? -1))
    } else {
      list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    }

    return list
  }, [localApplications, searchTerm, hasScoredLocal, isAnyScored])

  // ─── Bulk Score handler ────────────────────────────────────────────────────
  const handleRunBulkAiScoring = (options: {
    thresholdPercent: number
    autoRejectBelowThreshold: boolean
  }) => {
    setThresholdPercent(options.thresholdPercent)

    bulkScore(
      {
        thresholdPercent: options.thresholdPercent,
        autoRejectBelowThreshold: options.autoRejectBelowThreshold,
      },
      {
        onSuccess: (data) => {
          if (data.allApplications && data.allApplications.length > 0) {
            setLocalApplications(data.allApplications)
          }
          setHasScoredLocal(true)
          setSelectedIds(new Set())

          const parts: string[] = [`✅ Đã phân tích ${data.totalScored} CV thành công.`]
          if (data.autoRejectedCount > 0)
            parts.push(`🚫 Tự động từ chối ${data.autoRejectedCount} CV dưới ${options.thresholdPercent}%.`)
          if (data.aboveThresholdCount > 0)
            parts.push(`🎯 ${data.aboveThresholdCount} CV đạt ngưỡng.`)
          if (data.failedCount > 0)
            parts.push(`⚠ ${data.failedCount} CV lỗi (thiếu thông tin skill).`)

          toast.success(parts.join(' '))
        },
        onError: (err: Error) => {
          const msg = err?.message || ''
          if (msg.includes('APP_SCORING') || msg.includes('Credit')) {
            toast.error('Không đủ AI Credit hoặc gói công ty không có tính năng chấm điểm CV.')
          } else {
            toast.error('Có lỗi xảy ra khi chấm điểm hàng loạt. Vui lòng thử lại.')
          }
        },
      }
    )
  }

  // ─── Bulk Reject handler ───────────────────────────────────────────────────
  const handleConfirmBulkReject = () => {
    bulkReject([...selectedIds], {
      onSuccess: (rejectedApps) => {
        const rejectedSet = new Set(rejectedApps.map((a) => a.id))
        setLocalApplications((prev) =>
          prev.map((a) =>
            rejectedSet.has(a.id) ? { ...a, status: ApplicationStatus.REJECTED } : a
          )
        )
        setSelectedIds(new Set())
        setRejectModalOpen(false)
        toast.success(`Đã từ chối ${rejectedApps.length} đơn ứng tuyển thành công!`)
      },
      onError: () => {
        toast.error('Có lỗi xảy ra khi từ chối đơn. Vui lòng thử lại.')
      },
    })
  }

  const handleAcceptCv = (appId: string) => {
    setLocalApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: ApplicationStatus.SCORED } : a))
    )
    toast.success('Đã duyệt CV thành công!')
  }

  const handleRejectCv = (appId: string) => {
    setLocalApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: ApplicationStatus.REJECTED } : a))
    )
    toast.success('Đã từ chối đơn ứng tuyển!')
  }

  const selectedCount = selectedIds.size

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/recruiter/manage-jobs"
            className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Danh sách Đơn Ứng Tuyển
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quản lý, sàng lọc AI và xem chi tiết CV ứng viên
            </p>
          </div>
        </div>

        <Link
          href={`/recruiter/manage-jobs/${jobId}/interviews`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Quản lý Phỏng vấn</span>
        </Link>
      </div>

      {/* Bulk AI Scoring Bar */}
      <BulkAiScoringBar
        unscoredCount={unscoredCount}
        totalCount={localApplications.length}
        aiCreditBalance={myCompany?.aiCreditBalance ?? undefined}
        isScoring={isScoringBulk}
        thresholdPercent={thresholdPercent}
        onThresholdChange={setThresholdPercent}
        onRunBulkScore={handleRunBulkAiScoring}
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên ứng viên, tên CV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Selected count info & Floating Bulk Reject Button */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-xl px-4 py-2 animate-in fade-in duration-150">
            <CheckSquare className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs font-bold text-rose-800 dark:text-rose-200">
              Đã chọn <strong className="font-black text-rose-700 dark:text-rose-300">{selectedCount}</strong> đơn
            </span>
            <button
              type="button"
              onClick={() => setRejectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Từ chối {selectedCount} đơn đã chọn
            </button>
          </div>
        )}
      </div>

      {/* Applications Table with Real-time Dynamic Threshold Grayscaling */}
      <JobApplicationsTable
        applications={processedApplications}
        isLoading={isLoading}
        thresholdPercent={thresholdPercent}
        onViewCv={(id) => setSelectedAppId(id)}
        currentPage={currentPage}
        totalPages={pageData?.page?.totalPages ?? 1}
        totalItems={pageData?.page?.totalElements ?? processedApplications.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
        onItemsPerPageChange={(s) => {
          setItemsPerPage(s)
          setCurrentPage(1)
        }}
        showCheckboxes={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Detail Modal */}
      {selectedAppId && (
        <ApplicationDetailModal
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onAccept={(id) => {
            acceptApp(id)
            handleAcceptCv(id)
          }}
          onReject={(id) => {
            rejectApp(id)
            handleRejectCv(id)
          }}
        />
      )}

      {/* Reject Selected Confirm Modal */}
      {rejectModalOpen && (
        <RejectSelectedModal
          selectedCount={selectedCount}
          thresholdPercent={thresholdPercent}
          isLoading={isRejecting}
          onConfirm={handleConfirmBulkReject}
          onClose={() => setRejectModalOpen(false)}
        />
      )}
    </div>
  )
}
