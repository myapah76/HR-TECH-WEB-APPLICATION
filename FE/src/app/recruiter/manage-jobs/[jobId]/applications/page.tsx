'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Search, Calendar } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import BulkAiScoringBar from '@/src/components/recruiter/applications/BulkAiScoringBar'
import ApplicationDetailModal from '@/src/components/recruiter/applications/ApplicationDetailModal'
import JobApplicationsTable from '@/src/components/recruiter/applications/JobApplicationsTable'
import { ApplicationStatus, ApplicationSummaryResponse } from '@/src/types'
import {
  useGetApplicationsByJob,
  useAcceptApplication,
  useRejectApplication,
} from '@/src/hooks/application'
import { useGetMyCompany } from '@/src/hooks/company'

export default function JobApplicationsPage() {
  const params = useParams()
  const jobId = (params?.jobId as string) || 'job-default'

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: myCompany } = useGetMyCompany()
  const { data: pageData, isLoading } = useGetApplicationsByJob(
    jobId,
    currentPage - 1,
    itemsPerPage,
    ApplicationStatus.SUBMITTED
  )
  const apiApplications = pageData?.content ?? []

  const [applications, setApplications] = useState<ApplicationSummaryResponse[]>(
    () => apiApplications
  )

  // Sync when API returns data
  useEffect(() => {
    setApplications(apiApplications)
  }, [apiApplications])

  const { mutate: acceptApp } = useAcceptApplication()
  const { mutate: rejectApp } = useRejectApplication()

  const [hasScoredLocal, setHasScoredLocal] = useState(false)
  const [isScoringBulk, setIsScoringBulk] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Calculated stats
  const unscoredCount = useMemo(
    () => applications.filter((app) => !app.overallScore).length,
    [applications]
  )

  // Applications list sorting logic:
  // Unscored initially -> Sorted by appliedAt descending
  // After AI trigger -> Sorted by overallScore descending!
  const processedApplications = useMemo(() => {
    let list = [...applications]

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter(
        (app) =>
          (app.candidateName && app.candidateName.toLowerCase().includes(q)) ||
          (app.cvTitle && app.cvTitle.toLowerCase().includes(q))
      )
    }

    if (hasScoredLocal) {
      list.sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))
    } else {
      list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    }

    return list
  }, [applications, searchTerm, hasScoredLocal])

  const handleRunBulkAiScoring = (options: {
    thresholdPercent: number
    autoRejectBelowThreshold: boolean
    sendRejectionEmail: boolean
  }) => {
    setIsScoringBulk(true)

    setTimeout(() => {
      // Mock scores generator
      const mockScores: Record<string, { score: number; grade: string }> = {
        'app-mock-1': { score: 92.5, grade: 'A' },
        'app-mock-2': { score: 85.0, grade: 'A' },
        'app-mock-3': { score: 78.0, grade: 'B' },
        'app-mock-4': { score: 64.5, grade: 'B' },
        'app-mock-5': { score: 52.0, grade: 'C' },
        'app-mock-6': { score: 41.0, grade: 'D' },
      }

      setApplications((prev) =>
        prev.map((app) => {
          const aiData = mockScores[app.id] || {
            score: Math.floor(Math.random() * 40) + 55,
            grade: 'B',
          }
          const isBelow = aiData.score < options.thresholdPercent
          const newStatus =
            isBelow && options.autoRejectBelowThreshold
              ? ApplicationStatus.REJECTED
              : ApplicationStatus.SCORED

          return {
            ...app,
            overallScore: aiData.score,
            grade: aiData.grade,
            status: newStatus,
          }
        })
      )

      setHasScoredLocal(true)
      setIsScoringBulk(false)

      toast.success(
        `Đã kích hoạt AI phân tích ${unscoredCount} CV! Các CV có điểm tương thích cao nhất đã được đẩy lên đầu bảng.`
      )
    }, 1200)
  }

  const handleAcceptCv = (appId: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: ApplicationStatus.SCORED } : a))
    )
    toast.success('Đã duyệt CV vào danh sách thành công!')
  }

  const handleRejectCv = (appId: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: ApplicationStatus.REJECTED } : a))
    )
    toast.success('Đã từ chối đơn ứng tuyển!')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/recruiter/manage-jobs"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Danh sách Đơn Ứng Tuyển
            </h1>
          </div>
        </div>

        <Link
          href={`/recruiter/manage-jobs/${jobId}/interviews`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
        >
          <Calendar className="w-4 h-4" />
          <span>Quản lý Phỏng vấn Nhiều vòng</span>
        </Link>
      </div>

      <BulkAiScoringBar
        unscoredCount={unscoredCount}
        aiCreditBalance={myCompany?.aiCreditBalance ?? 50}
        isScoring={isScoringBulk}
        onRunBulkScore={handleRunBulkAiScoring}
      />

      {/* 2. Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên ứng viên, tên CV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Main Applications Table Component with Pagination */}
      <JobApplicationsTable
        applications={processedApplications}
        isLoading={isLoading}
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
      />

      {/* Detail Modal */}
      {selectedAppId && (
        <ApplicationDetailModal
          applicationId={selectedAppId}
          onClose={() => setSelectedAppId(null)}
          onAccept={(id) => acceptApp(id)}
          onReject={(id) => rejectApp(id)}
        />
      )}
    </div>
  )
}
