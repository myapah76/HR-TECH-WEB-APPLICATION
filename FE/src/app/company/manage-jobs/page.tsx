'use client'

import Link from 'next/link'
import { Briefcase, Loader2, PlusCircle } from 'lucide-react'

import ManageJobTable from '@/src/components/company/job/ManageJobTable'
import { useGetMyCompany } from '@/src/hooks/company/company.hooks'
import { useGetManageJobs } from '@/src/hooks/job/job.hooks'

export default function ManageJobPage() {
  const {
    data: myCompany,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
  } = useGetMyCompany()
  const {
    data: jobs = [],
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useGetManageJobs(myCompany?.id)

  const isLoading = isCompanyLoading || isJobsLoading
  const isError = isCompanyError || isJobsError

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
          href="/company/post-job"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-700"
        >
          <PlusCircle className="h-4 w-4" />
          Đăng tin mới
        </Link>
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
        <ManageJobTable jobs={jobs} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-lg font-bold text-slate-900">Chưa có tin tuyển dụng</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tạo tin tuyển dụng đầu tiên để bắt đầu tìm kiếm ứng viên.
          </p>
          <Link
            href="/company/post-job"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            <PlusCircle className="h-4 w-4" />
            Đăng tin mới
          </Link>
        </div>
      )}
    </div>
  )
}
