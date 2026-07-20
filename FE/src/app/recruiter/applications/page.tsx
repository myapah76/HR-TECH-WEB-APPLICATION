'use client'

import { useMemo, useState } from 'react'
import { Users, Briefcase, Loader2, TrendingUp } from 'lucide-react'
import SearchInput from '@/src/components/common/SearchInput'
import FilterSelect from '@/src/components/common/FilterSelect'
import {
  useGetApplicationsByJob,
  useGetAllJobApplications,
  useScheduleInterview,
  useUpdateApplicationStatus,
  useRejectCandidateReschedule,
  useAcceptCandidateReschedule,
} from '@/src/hooks/application'
import { useGetManageJobs } from '@/src/hooks/job'
import { useGetMyCompany } from '@/src/hooks/company'
import {
  ApplicationStatus,
  ApplicationSummaryResponse,
  ScheduleInterviewRequest,
  UpdateApplicationStatusRequest,
} from '@/src/types'
import ApplicationDetailModal from '@/src/components/recruiter/applications/ApplicationDetailModal'
import { toast } from 'sonner'
import { getErrorMessage } from '@/src/utils'

import {
  STATUS_CONFIG,
  FILTER_STATUS_OPTIONS,
  ApplicationRow,
} from '@/src/components/recruiter/applications/ApplicationRow'
import Pagination from '@/src/components/common/Pagination'

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HRApplicationsPage() {
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState<ApplicationSummaryResponse | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: myCompany } = useGetMyCompany()
  const { data: jobsPage, isLoading: isJobsLoading } = useGetManageJobs(myCompany?.id, {
    page: 0,
    size: 100,
  })
  const jobs = jobsPage?.content ?? []

  // ─── Fetch đơn theo job đã chọn (Paginated if single job) ───────────────────
  const { data: singleJobPage, isLoading: isSingleJobLoading } = useGetApplicationsByJob(
    selectedJobId || undefined,
    selectedJobId ? currentPage - 1 : 0,
    selectedJobId ? itemsPerPage : 100
  )
  const singleJobData = singleJobPage?.content || []

  const { data: allApplications = [], isLoading: isAllAppsLoading } = useGetAllJobApplications(
    jobs,
    selectedJobId === ''
  )

  const applications: ApplicationSummaryResponse[] = useMemo(() => {
    const raw = selectedJobId ? singleJobData : allApplications
    return [...raw].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
  }, [selectedJobId, singleJobData, allApplications])
  const isAppsLoading = selectedJobId ? isSingleJobLoading : isAllAppsLoading

  const updateStatus = useUpdateApplicationStatus()
  const scheduleInterview = useScheduleInterview()
  const acceptCandidateReschedule = useAcceptCandidateReschedule()
  const rejectCandidateReschedule = useRejectCandidateReschedule()

  // ─── Filter & Pagination ───────────────────────────────────────────────────
  const filtered = applications.filter((app) => {
    const matchStatus = !filterStatus || app.status === filterStatus
    const matchSearch =
      !searchQuery ||
      app.cvTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const isServerPaginated = Boolean(selectedJobId) && !filterStatus && !searchQuery
  const totalItems = isServerPaginated
    ? (singleJobPage?.page?.totalElements ?? filtered.length)
    : filtered.length
  const totalPages = isServerPaginated
    ? (singleJobPage?.page?.totalPages ?? 1)
    : Math.ceil(totalItems / itemsPerPage) || 1

  const displayApps = isServerPaginated
    ? filtered
    : filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleStatusUpdate = (id: string, request: UpdateApplicationStatusRequest) => {
    updateStatus.mutate({ id, request })
    if (selectedApp?.id === id) {
      setSelectedApp({ ...selectedApp, status: request.status })
    }
  }

  const handleScheduleInterview = (id: string, request: ScheduleInterviewRequest) => {
    scheduleInterview.mutate(
      { id, request },
      {
        onSuccess: (updated) => {
          if (selectedApp?.id === id) {
            setSelectedApp({ ...selectedApp, ...updated })
          }
        },
      }
    )
  }

  const handleAcceptCandidateReschedule = (id: string) => {
    acceptCandidateReschedule.mutate(id, {
      onSuccess: (updated) => {
        toast.success('Đã chấp nhận lịch phỏng vấn ứng viên đề xuất.')
        if (selectedApp?.id === id) {
          setSelectedApp({ ...selectedApp, ...updated })
        }
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
      },
    })
  }

  const handleRejectCandidateReschedule = (id: string) => {
    rejectCandidateReschedule.mutate(id, {
      onSuccess: (updated) => {
        toast.success('Đã từ chối yêu cầu đổi lịch phỏng vấn.')
        if (selectedApp?.id === id) {
          setSelectedApp({ ...selectedApp, ...updated })
        }
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
      },
    })
  }
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ─── Filter Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Job Selector */}
          <FilterSelect
            id="select-job"
            value={selectedJobId}
            onChange={(v) => { setSelectedJobId(v); setFilterStatus('') }}
            icon={Briefcase}
            placeholder="— Tất cả tin tuyển dụng —"
            options={isJobsLoading ? [] : jobs.map((j) => ({ value: j.id, label: j.title }))}
            className="flex-1"
          />

          {/* Search */}
          <SearchInput
            id="search-applications"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm theo tên CV, vị trí..."
            className="sm:w-64"
          />

          {/* Status Filter */}
          <FilterSelect
            id="filter-status"
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as ApplicationStatus | '')}
            options={FILTER_STATUS_OPTIONS}
            className="sm:w-52"
          />
        </div>
      </div>

      {/* ─── Table / States ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
        {/* Table header info */}
        {!isAppsLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">
              <span className="text-slate-800 font-black">{totalItems}</span> hồ sơ
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
                {displayApps.map((app) => (
                  <ApplicationRow key={app.id} app={app} onViewDetail={setSelectedApp} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalItems >= 10 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}

      {/* ─── Detail Modal ────────────────────────────────────────────────────── */}
      {selectedApp && (
        <ApplicationDetailModal
          applicationId={selectedApp.id}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusUpdate}
          onScheduleInterview={handleScheduleInterview}
          onAcceptCandidateReschedule={handleAcceptCandidateReschedule}
          onRejectCandidateReschedule={handleRejectCandidateReschedule}
          isSchedulingInterview={scheduleInterview.isPending}
          isReviewingCandidateReschedule={
            acceptCandidateReschedule.isPending || rejectCandidateReschedule.isPending
          }
        />
      )}
    </div>
  )
}
