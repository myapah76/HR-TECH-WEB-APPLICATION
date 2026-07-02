'use client'

import Link from 'next/link'
import { Heart, Trash2, MapPin, DollarSign, Briefcase, Award, ArrowRight } from 'lucide-react'
import { CompanyLogo } from '@/src/components/jobs/CompanyLogo'
import { toast } from 'sonner'
import { useGetSavedJobs, useUnsaveJob } from '@/src/hooks/job'
import Loading from '@/src/app/loading'
import { formatSalary } from '@/src/utils'

export default function SavedJobsPage() {
  // Lấy danh sách công việc đã lưu từ Backend
  const { data: savedJobs = [], isLoading } = useGetSavedJobs()

  // Mutation để bỏ lưu công việc
  const unsaveMutation = useUnsaveJob()

  const handleUnsave = (jobId: string) => {
    unsaveMutation.mutate(jobId, {
      onSuccess: () => {
        toast.success('Đã bỏ lưu công việc thành công')
      },
    })
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Danh sách công việc đã lưu */}
      <div className="space-y-4">
        {savedJobs.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/60 shadow-xs flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <Heart className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-400 font-semibold text-sm">Bạn chưa lưu công việc nào.</p>
            <Link
              href="/jobs"
              className="mt-2 text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all border border-blue-100/30"
            >
              Tìm kiếm việc làm ngay
            </Link>
          </div>
        ) : (
          savedJobs.map((job) => {
            const salaryText = formatSalary(job.salaryMin, job.salaryMax)

            return (
              <div
                key={job.id}
                className="group relative bg-white rounded-2xl border border-slate-200/50 p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:border-blue-200/80 hover:-translate-y-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4.5 flex-1 min-w-0">
                  <CompanyLogo url={job.companyLogoUrl} name={job.companyName} />

                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="inline-block text-base font-extrabold text-slate-800 hover:text-blue-600 transition-colors truncate max-w-full"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{job.companyName}</p>
                    </div>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 bg-emerald-50/70 px-2.5 py-0.5 rounded-lg border border-emerald-100/30">
                        <DollarSign className="h-3 w-3" />
                        {salaryText}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                      {job.jobType && (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600 bg-blue-50/70 px-2.5 py-0.5 rounded-lg border border-blue-100/30">
                          <Briefcase className="h-3 w-3" />
                          {job.jobType}
                        </span>
                      )}
                      {job.experienceLevel && (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-violet-600 bg-violet-50/70 px-2.5 py-0.5 rounded-lg border border-violet-100/30">
                          <Award className="h-3 w-3" />
                          {job.experienceLevel}
                        </span>
                      )}
                    </div>

                    {/* Skill Badges */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {job.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill.id}
                            className="text-[10px] font-extrabold text-slate-500 bg-slate-100/60 border border-slate-200/30 px-2.5 py-0.5 rounded-full"
                          >
                            {skill.skillName}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="text-[9px] font-black text-slate-400 bg-slate-100/30 px-2 py-0.5 rounded-full border border-slate-200/20">
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto justify-end border-slate-100">
                  <button
                    onClick={() => handleUnsave(job.id)}
                    disabled={unsaveMutation.isPending}
                    className="text-rose-500 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-50 p-2.5 rounded-xl cursor-pointer transition-all shrink-0 disabled:opacity-50 flex items-center justify-center border border-rose-100/40"
                    title="Bỏ lưu"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-center gap-1 text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50/40 hover:bg-blue-50/80 px-4 py-2.5 rounded-xl transition-all border border-blue-100/30 hover:border-blue-200/50 group/btn shadow-xs hover:shadow-sm"
                  >
                    Xem chi tiết
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
