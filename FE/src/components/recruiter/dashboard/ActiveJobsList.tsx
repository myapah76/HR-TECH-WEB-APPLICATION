import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatSalary } from '@/src/utils/salary'

interface ActiveJobsListProps {
  activeJobs: any[]
  isLoading?: boolean
}

export default function ActiveJobsList({ activeJobs, isLoading }: ActiveJobsListProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm text-left flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Tin đang tuyển</h3>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100/60 dark:border-emerald-900/40">
            {activeJobs.length} tin hoạt động
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.length > 0 ? (
              activeJobs.slice(0, 3).map((job: any, idx) => {
                const jobAppCount = job.applicantCount ?? 0
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-950/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all duration-200 flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        <span>{job.location || 'Hà Nội'}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-250 dark:bg-slate-700" />
                        <span className="text-emerald-600 dark:text-emerald-400">{formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        {jobAppCount} đơn nộp
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-10 text-sm font-semibold text-slate-400 dark:text-slate-500">
                Chưa có tin tuyển dụng nào đang chạy
              </div>
            )}
          </div>
        )}
      </div>

      {!isLoading && (
        <div className="pt-4">
          <Link
            href="/recruiter/manage-jobs"
            className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-all duration-200"
          >
            <span>Quản lý tin tuyển dụng</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
