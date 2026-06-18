'use client'

import { MapPin, DollarSign, Calendar, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Job } from '@/src/types/job'
import { CompanyLogo } from '@/src/components/jobs/CompanyLogo'

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  const router = useRouter()

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Thỏa thuận'
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  return (
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_35px_rgba(0,0,0,0.06)] hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col md:flex-row justify-between items-start gap-6 group relative overflow-hidden"
    >
      {/* Decorative gradient border on top on hover */}
      <div className="absolute top-0 left-0 w-full h-0.75 bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex gap-5 flex-1 min-w-0 items-start">
        {/* Company Logo */}
        <CompanyLogo url={job.companyLogoUrl} name={job.companyName} />

        <div className="flex-1 min-w-0 space-y-3.5">
          {/* Job Title and Badges */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.75 bg-slate-100 text-slate-600 rounded-lg uppercase tracking-wide">
                {job.companyName}
              </span>
              {job.jobType && (
                <span className="text-xs font-black px-2.5 py-0.75 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100/50">
                  {job.jobType}
                </span>
              )}
              {job.experienceLevel && (
                <span className="text-xs font-black px-2.5 py-0.75 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {job.experienceLevel}
                </span>
              )}
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight leading-snug">
              {job.title}
            </h3>
          </div>

          {/* Job Info Badges */}
          <div className="flex flex-wrap gap-2 text-xs font-extrabold">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100/60">
              <DollarSign className="h-4 w-4 text-amber-600" />
              <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
            </span>

            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-650 rounded-xl border border-slate-150">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{job.location}</span>
            </span>

            {job.deadline && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-650 rounded-xl border border-slate-150 font-semibold">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
              </span>
            )}
          </div>

          {/* Skills tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {job.skills?.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-lg border border-slate-200/60 uppercase tracking-wider transition-colors"
              >
                {skill.skillName}
              </span>
            ))}
            {job.skills?.length > 5 && (
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200">
                +{job.skills.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Status and Favorites */}
      <div className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto shrink-0 self-stretch mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 sm:border-none">
        <div className="flex items-center gap-2.5">
          {job.status === 'OPEN' ? (
            <span className="text-[10px] font-black tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-xl uppercase leading-none shadow-xs">
              Đang tuyển
            </span>
          ) : (
            <span className="text-[10px] font-black tracking-widest bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1.5 rounded-xl uppercase leading-none">
              Đóng tuyển
            </span>
          )}
        </div>

        <span className="text-[11px] font-bold text-slate-450 tracking-wide mt-2 sm:mt-auto">
          Đăng ngày: {new Date(job.createdAt).toLocaleDateString('vi-VN')}
        </span>
      </div>
    </div>
  )
}
