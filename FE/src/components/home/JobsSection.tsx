'use client'

import { CompanyLogo } from '@/src/components/jobs/CompanyLogo'
import { ArrowRight, DollarSign, MapPin } from 'lucide-react'
import { useSearchJobs } from '@/src/hooks/job'
import { Job } from '@/types'
import { formatSalary } from '@/src/utils/salary'
import { useRouter } from 'next/navigation'

export default function JobsSection() {
  const router = useRouter()
  const { data, isLoading } = useSearchJobs({
    page: 0,
    size: 6,
    sort: 'createdAt,desc',
  })

  const jobs = data?.content || []

  return (
    <section
      className="bg-slate-50/30 dark:bg-slate-900/10 py-16 scroll-mt-20 transition-colors"
      id="all-jobs-feed"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title Block */}
        <div className="text-center mb-10" id="jobs-section-header">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {'CƠ HỘI NGHỀ NGHIỆP MỚI NHẤT'}
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5 font-bold uppercase tracking-wider">
            {'ỨNG TUYỂN NGAY CÁC CÔNG VIỆC IT HOT VỪA CẬP NHẬT'}
          </p>
        </div>

        {/* Jobs Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5" id="jobs-cards-grid">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/70 p-5 rounded-3xl flex gap-4 items-start animate-pulse h-40"
              >
                <div className="h-16 w-16 rounded-2xl bg-slate-105 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  <div className="h-6 bg-slate-105 rounded-lg w-1/3 mt-4" />
                  <div className="flex gap-2 mt-3">
                    <div className="h-5 bg-slate-100 rounded-md w-16" />
                    <div className="h-5 bg-slate-100 rounded-md w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : jobs.length > 0 ? (
            jobs.map((job: Job) => (
              <div
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="group relative bg-white border border-slate-200/70 p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_35px_rgba(0,0,0,0.06)] hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex gap-4 items-start active:scale-99"
                id={`job-feed-card-${job.id}`}
              >
                {/* Logo with Initials or Image Logo */}
                <CompanyLogo url={job.companyLogoUrl} name={job.companyName} />

                {/* Info Container */}
                <div className="flex-1 min-w-0" id={`job-details-wrapper-${job.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-605 transition-colors tracking-tight line-clamp-1"
                      id={`job-title-${job.id}`}
                    >
                      {job.title}
                    </h3>

                    <div className="flex gap-1 shrink-0">
                      <span className="text-[9px] font-extrabold px-2.5 py-0.75 bg-slate-100 text-slate-655 rounded-lg uppercase tracking-wide">
                        {job.jobType}
                      </span>
                    </div>
                  </div>

                  <p
                    className="text-xs font-semibold text-slate-500 mt-1 line-clamp-1"
                    id={`job-company-${job.id}`}
                  >
                    {job.companyName}
                  </p>

                  <div
                    className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-slate-550"
                    id={`job-meta-row-${job.id}`}
                  >
                    <span
                      className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/80 border border-emerald-100/50 px-2.5 py-1 rounded-lg font-bold shadow-2xs"
                      id={`job-salary-${job.id}`}
                    >
                      <DollarSign className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </span>
                    <span className="flex items-center gap-1" id={`job-location-${job.id}`}>
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{job.location}</span>
                    </span>
                  </div>

                  {/* Skills preview bar */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5" id={`job-skills-list-${job.id}`}>
                    {job.skills &&
                      job.skills.slice(0, 3).map((sk) => (
                        <span
                          key={sk.id}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-lg border border-slate-200/60 uppercase tracking-wider transition-colors"
                          id={`job-skill-${sk.skillName}-${job.id}`}
                        >
                          {sk.skillName}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className="col-span-full bg-white border border-slate-200/70 rounded-3xl p-12 text-center text-slate-500 font-semibold shadow-xs"
              id="jobs-empty-state"
            >
              {'Không tìm thấy việc làm phù hợp.'}
            </div>
          )}
        </div>

        {/* Redirect CTA row */}
        <div
          className="mt-12 flex items-center justify-center border-t border-slate-200/60 dark:border-slate-800/80 pt-8"
          id="pagination-panel"
        >
          <button
            onClick={() => router.push('/jobs')}
            className="flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group cursor-pointer hover:scale-102"
            id="btn-latest-redirect"
          >
            <span>{'Xem tất cả việc làm'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  )
}
