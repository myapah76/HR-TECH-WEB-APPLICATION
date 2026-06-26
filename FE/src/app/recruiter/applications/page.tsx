'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useQueries } from '@tanstack/react-query'
import {
  Users,
  Briefcase,
  Search,
  Filter,
  ChevronDown,
  Clock,
  Brain,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Inbox,
  Eye,
} from 'lucide-react'
import {
  useGetApplicationsByJob,
  useUpdateApplicationStatus,
} from '@/src/hooks/application'
import { getApplicationsByJob } from '@/src/services/application.service'
import { useGetManageJobs } from '@/src/hooks/job'
import { useGetMyCompany } from '@/src/hooks/company'
import { ApplicationStatus, ApplicationSummaryResponse } from '@/src/types'
import ApplicationDetailModal from '@/src/components/recruiter/ApplicationDetailModal'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  SUBMITTED: { label: 'Mới nộp', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  SCREENING: { label: 'Đang xét', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  SCORED: { label: 'Đã chấm', color: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-500' },
  INTERVIEW: { label: 'Phỏng vấn', color: 'text-indigo-700', bg: 'bg-indigo-50', dot: 'bg-indigo-500' },
  OFFER: { label: 'Offer', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  REJECTED: { label: 'Từ chối', color: 'text-rose-700', bg: 'bg-rose-50', dot: 'bg-rose-500' },
  WITHDRAWN: { label: 'Đã rút', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
}

const FILTER_STATUS_OPTIONS: { value: ApplicationStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'SUBMITTED', label: 'Mới nộp' },
  { value: 'SCREENING', label: 'Đang xét' },
  { value: 'SCORED', label: 'Đã chấm điểm AI' },
  { value: 'INTERVIEW', label: 'Phỏng vấn' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'WITHDRAWN', label: 'Đã rút' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds} giây trước`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  return `${Math.floor(hours / 24)} ngày trước`
}

// Hook tự cập nhật thời gian real-time
function useRelativeTime(dateStr: string) {
  const compute = useCallback(() => calcTimeAgo(dateStr), [dateStr])
  const [label, setLabel] = useState(compute)

  useEffect(() => {
    setLabel(compute())
    // Cập nhật mỗi 30 giây
    const id = setInterval(() => setLabel(compute()), 30_000)
    return () => clearInterval(id)
  }, [compute])

  return label
}

// Component hiển thị thời gian real-time
function RelativeTime({ dateStr }: { dateStr: string }) {
  const label = useRelativeTime(dateStr)
  return (
    <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ApplicationStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Application Row ──────────────────────────────────────────────────────────
function ApplicationRow({
  app,
  onViewDetail,
}: {
  app: ApplicationSummaryResponse
  onViewDetail: (app: ApplicationSummaryResponse) => void
}) {
  const initials = app.cvTitle?.slice(0, 2).toUpperCase() || 'UV'
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
  const colorIdx = app.id.charCodeAt(0) % colors.length

  return (
    <tr
      className="group hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer"
      onClick={() => onViewDetail(app)}
    >
      {/* Avatar + CV */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${colors[colorIdx]} flex items-center justify-center text-white text-xs font-black shrink-0`}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate max-w-[180px]">{app.cvTitle}</p>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              <FileText className="w-3 h-3" />
              CV đính kèm
            </p>
          </div>
        </div>
      </td>

      {/* Job */}
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{app.jobTitle}</p>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <StatusBadge status={app.status} />
      </td>

      {/* Applied */}
      <td className="px-4 py-4">
        <RelativeTime dateStr={app.appliedAt} />
      </td>

      {/* Action */}
      <td className="px-4 py-4">
        <button
          id={`view-app-${app.id}`}
          onClick={(e) => { e.stopPropagation(); onViewDetail(app) }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-600 hover:shadow-md active:scale-95 transition-all duration-150"
        >
          <Eye className="w-3.5 h-3.5" />
          Xem
        </button>
      </td>
    </tr>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HRApplicationsPage() {
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState<ApplicationSummaryResponse | null>(null)

  const { data: myCompany } = useGetMyCompany()
  const { data: jobsPage, isLoading: isJobsLoading } = useGetManageJobs(myCompany?.id, {
    page: 0,
    size: 100,
  })
  const jobs = jobsPage?.content ?? []

  // ─── Fetch đơn theo job đã chọn ────────────────────────────────────────────
  const { data: singleJobData = [], isLoading: isSingleJobLoading } = useGetApplicationsByJob(
    selectedJobId || undefined
  )

  // ─── Fetch tất cả jobs song song khi không chọn job cụ thể ─────────────────
  const allJobQueries = useQueries({
    queries: jobs.map((job) => ({
      queryKey: ['applications', 'job', job.id] as const,
      queryFn: (): Promise<ApplicationSummaryResponse[]> => getApplicationsByJob(job.id),
      enabled: selectedJobId === '' && jobs.length > 0,
    })),
  })

  const allApplications = useMemo<ApplicationSummaryResponse[]>(() => {
    const merged = allJobQueries.flatMap((q) => (q.data as ApplicationSummaryResponse[]) ?? [])
    const seen = new Set<string>()
    return merged.filter((a) => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })
  }, [allJobQueries])

  const isAllAppsLoading = selectedJobId === '' && jobs.length > 0 && allJobQueries.some((q) => q.isLoading)

  const applications: ApplicationSummaryResponse[] = selectedJobId ? singleJobData : allApplications
  const isAppsLoading = selectedJobId ? isSingleJobLoading : isAllAppsLoading

  const updateStatus = useUpdateApplicationStatus()

  // ─── Derived stats ─────────────────────────────────────────────────────────
  const stats = {
    total: applications.length,
    submitted: applications.filter((a) => a.status === 'SUBMITTED').length,
    interview: applications.filter((a) => a.status === 'INTERVIEW').length,
    offer: applications.filter((a) => a.status === 'OFFER').length,
  }

  // ─── Filter ─────────────────────────────────────────────────────────────────
  const filtered = applications.filter((app) => {
    const matchStatus = !filterStatus || app.status === filterStatus
    const matchSearch =
      !searchQuery ||
      app.cvTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleStatusUpdate = (id: string, status: ApplicationStatus) => {
    updateStatus.mutate({ id, status })
    if (selectedApp?.id === id) {
      setSelectedApp({ ...selectedApp, status })
    }
  }

  return (
    <div className="max-w-7xl space-y-6 animate-fade-in pb-12">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-black text-slate-900">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            Đơn ứng tuyển
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium ml-11">
            Xem xét và quản lý hồ sơ ứng viên
          </p>
        </div>
      </div>

      {/* ─── Stat Row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Inbox, label: 'Tổng hồ sơ', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-100' },
          { icon: AlertCircle, label: 'Mới nộp', value: stats.submitted, color: 'text-blue-700', bg: 'bg-blue-50' },
          { icon: Brain, label: 'Phỏng vấn', value: stats.interview, color: 'text-indigo-700', bg: 'bg-indigo-50' },
          { icon: Star, label: 'Đã Offer', value: stats.offer, color: 'text-emerald-700', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Filter Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Job Selector */}
          <div className="flex-1 relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              id="select-job"
              value={selectedJobId}
              onChange={(e) => { setSelectedJobId(e.target.value); setFilterStatus('') }}
              className="w-full pl-9 pr-9 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
            >
              <option value="">— Tất cả tin tuyển dụng —</option>
              {isJobsLoading ? (
                <option disabled>Đang tải...</option>
              ) : (
                jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="search-applications"
              type="text"
              placeholder="Tìm theo tên CV, vị trí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative sm:w-52">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | '')}
              className="w-full pl-9 pr-9 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
            >
              {FILTER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── Table / States ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
        {/* Table header info */}
        {!isAppsLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">
              <span className="text-slate-800 font-black">{filtered.length}</span> hồ sơ
              {filterStatus && ` · ${STATUS_CONFIG[filterStatus].label}`}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              Sắp xếp mới nhất
            </div>
          </div>
        )}

        {/* Loading */}
        {isAppsLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-semibold text-slate-500">Đang tải hồ sơ...</p>
          </div>
        ) : !selectedJobId && jobs.length === 0 && !isJobsLoading ? (
          /* No jobs at all */
          <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-700">Chưa có tin tuyển dụng</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Bạn chưa đăng tin tuyển dụng nào. Hãy tạo tin để nhận hồ sơ ứng tuyển.
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty */
          <div className="flex flex-col items-center justify-center py-24 gap-4 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-700">Chưa có hồ sơ ứng tuyển</h3>
              <p className="text-sm text-slate-400 mt-1">
                {filterStatus || searchQuery
                    ? 'Không tìm thấy hồ sơ phù hợp với bộ lọc hiện tại'
                    : selectedJobId
                      ? 'Chưa có ứng viên nào nộp hồ sơ cho vị trí này'
                      : 'Chưa có hồ sơ nào được nộp'}
              </p>
            </div>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                    Ứng viên / CV
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                    Vị trí
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((app) => (
                  <ApplicationRow
                    key={app.id}
                    app={app}
                    onViewDetail={setSelectedApp}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Detail Modal ────────────────────────────────────────────────────── */}
      {selectedApp && (
        <ApplicationDetailModal
          applicationId={selectedApp.id}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusUpdate}
        />
      )}
    </div>
  )
}
