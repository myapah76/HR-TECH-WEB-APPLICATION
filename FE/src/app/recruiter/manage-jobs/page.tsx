'use client'

import { Briefcase, Loader2, PlusCircle, CheckCircle2, Lock, Users } from 'lucide-react'
import Link from 'next/link'
import SearchInput from '@/src/components/common/SearchInput'
import FilterSelect from '@/src/components/common/FilterSelect'
import { useUrlFilter } from '@/src/hooks/useUrlFilter'

import ManageJobTable from '@/components/recruiter/job/ManageJobTable'
import Pagination from '@/src/components/common/Pagination'
import StatCard from '@/src/components/ui/StatCard'
import {
  ExperienceLevel,
  JobStatus,
  JobType,
  EXPERIENCE_LEVEL_LABELS,
  JOB_STATUS_LABELS,
  JOB_TYPE_LABELS,
} from '@/src/enums/job.enum'
import { useGetMyCompanyMember, useGetMyCompany } from '@/src/hooks/company'
import { useGetManageJobs, useGetRecruiterJobStats } from '@/src/hooks/job'
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

export default function ManageJobPage() {
  const {
    keywordInput: keyword,
    setKeywordInput: setKeyword,
    urlKeyword,
    urlPage: pageNumber,
    urlSize: size,
    searchParams,
    updateUrlParams,
  } = useUrlFilter({
    defaultPage: 1,
    defaultSize: 10,
  })

  const page = pageNumber - 1
  const status = searchParams.get('status') || ''
  const jobType = searchParams.get('jobType') || ''
  const experienceLevel = searchParams.get('experienceLevel') || ''
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
    keyword: urlKeyword || undefined,
    status: status || undefined,
    jobType: jobType || undefined,
    experienceLevel: experienceLevel || undefined,
    page,
    size,
  })

  const { data: statsData, isLoading: isStatsLoading } = useGetRecruiterJobStats(myCompany?.id)

  const { data: currentMember, isLoading: isMemberLoading } = useGetMyCompanyMember(myCompany?.id)

  const isCardLoading = isCompanyLoading || isStatsLoading
  const isTableLoading = isCompanyLoading || isJobsLoading || isMemberLoading
  const isError = isCompanyError || isJobsError

  const jobs = pageData?.content ?? []
  const totalPages = pageData?.page?.totalPages ?? 0
  const totalElements = pageData?.page?.totalElements ?? 0

  // Thống kê Job Dashboard tổng quan (ưu tiên dữ liệu từ Stats API duy nhất)
  const approvedJobsCount =
    statsData?.approvedJobsCount ?? jobs.filter((j) => j.status === JobStatus.APPROVED).length
  const closedJobsCount =
    statsData?.closedJobsCount ?? jobs.filter((j) => j.status === JobStatus.CLOSED).length
  const totalJobsCount = statsData?.totalJobsCount ?? totalElements
  const totalApplicantsCount = statsData?.totalApplicantsCount ?? 18

  const handleFilterChange = (
    newStatus: string,
    newJobType: string,
    newExperienceLevel: string,
    newKeyword: string = ''
  ) => {
    updateUrlParams({
      status: newStatus || undefined,
      jobType: newJobType || undefined,
      experienceLevel: newExperienceLevel || undefined,
      keyword: newKeyword || undefined,
      page: 1,
    })
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-end">
        <Link
          href="/recruiter/post-job"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-700 shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Đăng tin mới
        </Link>
      </div>

      {/* Top Metric Cards (Loading độc lập theo isCardLoading) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Job đã duyệt"
          value={approvedJobsCount}
          color="emerald"
          isLoading={isCardLoading}
        />
        <StatCard
          icon={Lock}
          label="Job đã đóng"
          value={closedJobsCount}
          color="amber"
          isLoading={isCardLoading}
        />
        <StatCard
          icon={Briefcase}
          label="Tổng tin đã đăng"
          value={totalJobsCount}
          color="blue"
          isLoading={isCardLoading}
        />
        <StatCard
          icon={Users}
          label="Tổng số ứng viên"
          value={totalApplicantsCount}
          color="blue"
          isLoading={isCardLoading}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <SearchInput
          id="search-jobs"
          value={keyword}
          onChange={(v) => {
            setKeyword(v)
            updateUrlParams({ keyword: v || undefined })
          }}
          placeholder="Tìm theo tên tin, vị trí..."
          className="w-full sm:w-64"
        />

        <FilterSelect
          id="filter-status"
          value={status}
          onChange={(v) => handleFilterChange(v, jobType, experienceLevel, keyword)}
          options={STATUS_OPTIONS}
        />

        <FilterSelect
          id="filter-job-type"
          value={jobType}
          onChange={(v) => handleFilterChange(status, v, experienceLevel, keyword)}
          options={JOB_TYPE_OPTIONS}
        />

        <FilterSelect
          id="filter-experience-level"
          value={experienceLevel}
          onChange={(v) => handleFilterChange(status, jobType, v, keyword)}
          options={EXPERIENCE_LEVEL_OPTIONS}
        />

        {(status || jobType || experienceLevel || keyword) && (
          <button
            type="button"
            onClick={() => handleFilterChange('', '', '', '')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-xs transition-colors hover:border-rose-300 hover:text-rose-600"
          >
            Xóa bộ lọc
          </button>
        )}

        {!isTableLoading && totalElements > 0 && (
          <span className="ml-auto text-sm font-semibold text-slate-400">
            {totalElements} tin tuyển dụng
          </span>
        )}
      </div>

      {isTableLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
          <span className="ml-3 text-sm font-semibold text-slate-500">
            Đang tải tin tuyển dụng...
          </span>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-semibold text-red-600">
          Không thể tải danh sách tin tuyển dụng. Vui lòng thử lại sau.
        </div>
      ) : jobs.length > 0 ? (
        <>
          <ManageJobTable jobs={jobs} currentUserId={user?.id} companyRole={currentMember?.role} />

          <Pagination
            currentPage={pageNumber}
            totalPages={totalPages}
            totalItems={totalElements}
            itemsPerPage={size}
            onPageChange={(p) => updateUrlParams({ page: p })}
            onItemsPerPageChange={(s) => updateUrlParams({ size: s, page: 1 })}
          />
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
