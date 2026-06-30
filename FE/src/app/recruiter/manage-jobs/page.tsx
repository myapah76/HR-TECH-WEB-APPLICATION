'use client'

import { Briefcase, ChevronLeft, ChevronRight, Loader2, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import ManageJobTable from '@/src/components/company/job/ManageJobTable'
import {
  ExperienceLevel,
  JobStatus,
  JobType,
  EXPERIENCE_LEVEL_LABELS,
  JOB_STATUS_LABELS,
  JOB_TYPE_LABELS,
} from '@/src/enums/job.enum'
import { useGetCompanyMembers, useGetMyCompany } from '@/src/hooks/company'
import { useGetManageJobs } from '@/src/hooks/job'
import { useAuthStore } from '@/src/stores/auth.store'

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  ...Object.values(JobStatus).map((status) => ({
    value: status,
    label: JOB_STATUS_LABELS[status],
  })),
]

const JOB_TYPE_OPTIONS = [
  { value: '', label: 'Tất cả hình thức' },
  ...Object.values(JobType).map((type) => ({
    value: type,
    label: JOB_TYPE_LABELS[type],
  })),
]

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: '', label: 'Tất cả cấp bậc' },
  ...Object.values(ExperienceLevel).map((level) => ({
    value: level,
    label: EXPERIENCE_LEVEL_LABELS[level],
  })),
]

const PAGE_SIZE = 10

export default function ManageJobPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState('')
  const [jobType, setJobType] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const { user } = useAuthStore()

  const {
    data: myCompany,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
  } = useGetMyCompany()

  const {
    data: pageData,
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useGetManageJobs(myCompany?.id, {
    status: status || undefined,
    jobType: jobType || undefined,
    experienceLevel: experienceLevel || undefined,
    page,
    size: PAGE_SIZE,
  })

  const { data: companyMembers = [], isLoading: isMembersLoading } = useGetCompanyMembers(
    myCompany?.id
  )
  const currentMember = companyMembers.find((member) => member.userId === user?.id)

  const isLoading = isCompanyLoading || isJobsLoading || isMembersLoading
  const isError = isCompanyError || isJobsError

  const jobs = pageData?.content ?? []
  const totalPages = pageData?.totalPages ?? 0
  const totalElements = pageData?.totalElements ?? 0

  const handleFilterChange = (
    newStatus: string,
    newJobType: string,
    newExperienceLevel: string
  ) => {
    setPage(0)
    setStatus(newStatus)
    setJobType(newJobType)
    setExperienceLevel(newExperienceLevel)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Briefcase className="h-6 w-6 text-emerald-600" />
            Quản lý tin tuyển dụng
          </h1>
          <p className="mt-1 text-slate-500">
            Theo dõi và quản lý các tin tuyển dụng của công ty bạn.
          </p>
        </div>

        <Link
          href="/recruiter/post-job"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-700"
        >
          <PlusCircle className="h-4 w-4" />
          Đăng tin mới
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          id="filter-status"
          value={status}
          onChange={(e) => handleFilterChange(e.target.value, jobType, experienceLevel)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          id="filter-job-type"
          value={jobType}
          onChange={(e) => handleFilterChange(status, e.target.value, experienceLevel)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {JOB_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          id="filter-experience-level"
          value={experienceLevel}
          onChange={(e) => handleFilterChange(status, jobType, e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {EXPERIENCE_LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {(status || jobType || experienceLevel) && (
          <button
            type="button"
            onClick={() => handleFilterChange('', '', '')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-xs transition-colors hover:border-rose-300 hover:text-rose-600"
          >
            Xóa bộ lọc
          </button>
        )}

        {!isLoading && totalElements > 0 && (
          <span className="ml-auto text-sm font-semibold text-slate-400">
            {totalElements} tin tuyển dụng
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
          <span className="ml-3 text-sm font-semibold text-slate-500">Đang tải tin tuyển dụng...</span>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-semibold text-red-600">
          Không thể tải danh sách tin tuyển dụng. Vui lòng thử lại sau.
        </div>
      ) : jobs.length > 0 ? (
        <>
          <ManageJobTable
            jobs={jobs}
            currentUserId={user?.id}
            companyRole={currentMember?.role}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xs">
              <p className="text-sm font-semibold text-slate-500">
                Trang <span className="font-bold text-slate-800">{page + 1}</span> / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-lg font-bold text-slate-900">Chưa có tin tuyển dụng</h2>
          <p className="mt-1 text-sm text-slate-500">
            {status || jobType || experienceLevel
              ? 'Không tìm thấy tin tuyển dụng với bộ lọc hiện tại.'
              : 'Tạo tin tuyển dụng đầu tiên để bắt đầu tìm kiếm ứng viên.'}
          </p>
          {!status && !jobType && !experienceLevel && (
            <Link
              href="/recruiter/post-job"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
            >
              <PlusCircle className="h-4 w-4" />
              Đăng tin mới
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
