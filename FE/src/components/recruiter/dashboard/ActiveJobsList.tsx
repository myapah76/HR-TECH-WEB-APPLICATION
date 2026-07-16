import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface ActiveJobsListProps {
  activeJobs: any[]
  isLoading?: boolean
}

const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return 'Thỏa thuận'

  // Convert raw VNĐ to millions (e.g. 15000000 → 15M)
  const toM = (v: number) => {
    const m = v / 1_000_000
    return m >= 1 ? `${Number.isInteger(m) ? m : m.toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`
  }

  if (min && max) return `${toM(min)} - ${toM(max)}`
  if (min) return `Từ ${toM(min)}`
  return `Tối đa ${toM(max!)}`
}

export default function ActiveJobsList({ activeJobs, isLoading }: ActiveJobsListProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs text-left flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-900">Tin đang tuyển</h3>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/60">
            {activeJobs.length} tin hoạt động
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
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
                    className="p-3 rounded-xl border border-slate-100/80 bg-slate-50/10 hover:bg-slate-50/50 transition-all duration-200 flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-xs font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <span>{job.location || 'Hà Nội'}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-250" />
                        <span className="text-blue-600">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {jobAppCount} đơn nộp
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-10 text-sm font-semibold text-slate-400">
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
            className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all duration-200"
          >
            <span>Quản lý tin tuyển dụng</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
