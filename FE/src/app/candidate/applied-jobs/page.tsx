'use client'

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useMemo } from 'react'
import Link from 'next/link'
import { Send, Clock, Loader2, MapPin, DollarSign, ArrowRight, FileText, Sparkles } from 'lucide-react'
import { useGetMyApplications } from '@/src/hooks/application'
import { useGetJobs } from '@/src/hooks/job'
import { CompanyLogo } from '@/src/components/jobs/CompanyLogo'
import { ApplicationMatchModal } from '@/src/components/candidate/application/ApplicationMatchModal'
import { useState } from 'react'
import { formatDate, formatSalary } from '@/src/utils'

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  SUBMITTED: {
    label: 'Đã nộp',
    bg: 'bg-blue-50/70',
    text: 'text-blue-700',
    border: 'border-blue-100/40',
  },
  SCREENING: {
    label: 'Đang xem xét',
    bg: 'bg-amber-50/70',
    text: 'text-amber-700',
    border: 'border-amber-100/40',
  },
  SCORED: {
    label: 'Đã đánh giá',
    bg: 'bg-indigo-50/70',
    text: 'text-indigo-700',
    border: 'border-indigo-100/40',
  },
  INTERVIEW: {
    label: 'Phỏng vấn',
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-700',
    border: 'border-emerald-100/40',
  },
  OFFER: {
    label: 'Nhận Offer',
    bg: 'bg-purple-50/70',
    text: 'text-purple-700',
    border: 'border-purple-100/40',
  },
  REJECTED: {
    label: 'Từ chối',
    bg: 'bg-rose-50/70',
    text: 'text-rose-700',
    border: 'border-rose-100/40',
  },
  WITHDRAWN: {
    label: 'Đã rút',
    bg: 'bg-slate-50',
    text: 'text-slate-650',
    border: 'border-slate-200/50',
  },
}

export default function AppliedJobsPage() {
  const { data: applications = [], isLoading: loadingApps } = useGetMyApplications()

  const { data: jobsData, isLoading: loadingJobs } = useGetJobs(0, 100)

  const [matchApp, setMatchApp] = useState<{
    cvId: string
    jobId: string
    jobTitle: string
    companyName: string
  } | null>(null)

  const jobsMap = useMemo(() => {
    const map = new Map<string, any>()
    if (jobsData?.content) {
      jobsData.content.forEach((job) => {
        map.set(job.id, job)
      })
    }
    return map
  }, [jobsData])

  if (loadingApps || loadingJobs) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">
          Đang tải danh sách việc đã ứng tuyển...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6 animate-fade-in">

      {/* Danh sách ứng tuyển */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/60 shadow-xs flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <Send className="w-6 h-6 text-slate-350" />
            </div>
            <p className="text-slate-400 font-semibold text-sm">Bạn chưa ứng tuyển vị trí nào.</p>
            <Link
              href="/jobs"
              className="mt-2 text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all border border-blue-100/30"
            >
              Tìm kiếm việc làm ngay
            </Link>
          </div>
        ) : (
          applications.map((app) => {
            const jobDetail = jobsMap.get(app.jobId)
            const companyName = jobDetail?.companyName || 'Công ty ẩn danh'
            const companyLogo = jobDetail?.companyLogoUrl || null
            const location = jobDetail?.location || 'Chưa cập nhật'
            const statusInfo = statusConfig[app.status] || {
              label: app.status,
              bg: 'bg-slate-50',
              text: 'text-slate-650',
              border: 'border-slate-200/40',
            }

            const salaryText = formatSalary(jobDetail?.salaryMin, jobDetail?.salaryMax)

            return (
              <div
                key={app.id}
                className="group relative bg-white rounded-2xl border border-slate-200/50 p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:border-blue-200/80 hover:-translate-y-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4.5 flex-1 min-w-0">
                  <CompanyLogo url={companyLogo} name={companyName} />

                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div>
                      <Link
                        href={`/jobs/${app.jobId}`}
                        className="inline-block text-base font-extrabold text-slate-800 hover:text-blue-600 transition-colors truncate max-w-full"
                      >
                        {app.jobTitle}
                      </Link>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{companyName}</p>
                    </div>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 bg-emerald-50/70 px-2.5 py-0.5 rounded-lg border border-emerald-100/30">
                        <DollarSign className="h-3 w-3" />
                        {salaryText}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                        <MapPin className="h-3.5 w-3.5" />
                        {location}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                        <FileText className="h-3.5 w-3.5" />
                        CV: {app.cvTitle}
                      </span>
                      {app.appliedAt && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-450 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100/40">
                          <Clock className="h-3.5 w-3.5" />
                          Nộp ngày: {formatDate(app.appliedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-4 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto justify-end border-slate-100">
                  <span
                    className={`text-[10px] font-black tracking-widest ${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border} px-3 py-1.5 rounded-xl uppercase leading-none shadow-xs`}
                  >
                    {statusInfo.label}
                  </span>

                  <button
                    onClick={() =>
                      setMatchApp({
                        cvId: app.cvId,
                        jobId: app.jobId,
                        jobTitle: app.jobTitle,
                        companyName: companyName,
                      })
                    }
                    className="flex items-center justify-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-all border border-indigo-200/50 shadow-xs"
                    title="Đánh giá mức độ phù hợp bằng AI"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">AI Đánh giá</span>
                  </button>

                  <Link
                    href={`/jobs/${app.jobId}`}
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

      <ApplicationMatchModal
        isOpen={!!matchApp}
        onClose={() => setMatchApp(null)}
        cvId={matchApp?.cvId || ''}
        jobId={matchApp?.jobId || ''}
        jobTitle={matchApp?.jobTitle || ''}
        companyName={matchApp?.companyName || ''}
      />
    </div>
  )
}
