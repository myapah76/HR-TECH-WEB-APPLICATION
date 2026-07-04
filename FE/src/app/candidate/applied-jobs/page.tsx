'use client'

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Send,
  Clock,
  Loader2,
  MapPin,
  DollarSign,
  ArrowRight,
  FileText,
  Sparkles,
  CalendarCheck2,
  CheckCircle2,
  RefreshCw,
  X,
} from 'lucide-react'
import { useAcceptInterviewSchedule, useChangeInterviewSchedule, useGetMyApplications } from '@/src/hooks/application'
import { useGetJobs } from '@/src/hooks/job'
import { CompanyLogo } from '@/src/components/jobs/CompanyLogo'
import { ApplicationMatchModal } from '@/src/components/candidate/application/ApplicationMatchModal'
import { ApplicationStatus } from '@/src/types'
import { formatDate, formatDateTime, formatSalary, getErrorMessage } from '@/src/utils'
import Pagination from '@/src/components/common/Pagination'

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  SUBMITTED: {
    label: 'Đã nộp',
    bg: 'bg-blue-50/70',
    text: 'text-blue-700',
    border: 'border-blue-100/40',
  },
  SCORED: {
    label: 'Đã đánh giá',
    bg: 'bg-indigo-50/70',
    text: 'text-indigo-700',
    border: 'border-indigo-100/40',
  },
  PENDING_INTERVIEW_SCHEDULE: {
    label: 'Chờ xác nhận lịch',
    bg: 'bg-amber-50/70',
    text: 'text-amber-700',
    border: 'border-amber-100/40',
  },
  CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE: {
    label: 'Đã yêu cầu đổi lịch',
    bg: 'bg-cyan-50/70',
    text: 'text-cyan-700',
    border: 'border-cyan-100/40',
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: applicationsPage, isLoading: loadingApps } = useGetMyApplications(currentPage - 1, itemsPerPage)
  const applications = applicationsPage?.content || []
  const totalPages = applicationsPage?.totalPages || 1
  const totalElements = applicationsPage?.totalElements || 0

  const { data: jobsData, isLoading: loadingJobs } = useGetJobs(0, 100)
  const acceptScheduleMutation = useAcceptInterviewSchedule()
  const changeScheduleMutation = useChangeInterviewSchedule()

  const [matchApp, setMatchApp] = useState<{
    cvId: string
    jobId: string
    jobTitle: string
    companyName: string
  } | null>(null)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [changeFormApplicationId, setChangeFormApplicationId] = useState<string | null>(null)
  const [preferredInterviewDateTime, setPreferredInterviewDateTime] = useState('')
  const [scheduleChangeReason, setScheduleChangeReason] = useState('')

  const jobsMap = useMemo(() => {
    const map = new Map<string, any>()
    if (jobsData?.content) {
      jobsData.content.forEach((job) => {
        map.set(job.id, job)
      })
    }
    return map
  }, [jobsData])

  const handleAcceptSchedule = (applicationId: string) => {
    acceptScheduleMutation.mutate(applicationId, {
      onSuccess: () => {
        toast.success('Bạn đã xác nhận lịch phỏng vấn.')
        setChangeFormApplicationId(null)
        setPreferredInterviewDateTime('')
        setScheduleChangeReason('')
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
      },
    })
  }

  const handleSubmitChangeSchedule = (applicationId: string) => {
    if (!preferredInterviewDateTime) {
      toast.error('Vui lòng chọn thời gian phỏng vấn mong muốn.')
      return
    }

    if (!scheduleChangeReason.trim()) {
      toast.error('Vui lòng nhập lý do đổi lịch phỏng vấn.')
      return
    }

    const selectedDate = new Date(preferredInterviewDateTime)
    if (Number.isNaN(selectedDate.getTime())) {
      toast.error('Thời gian phỏng vấn không hợp lệ.')
      return
    }

    changeScheduleMutation.mutate(
      {
        id: applicationId,
        request: {
          candidatePreferredInterviewDateTime: selectedDate.toISOString(),
          reason: scheduleChangeReason.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success('Đã gửi yêu cầu đổi lịch phỏng vấn.')
          setChangeFormApplicationId(null)
          setPreferredInterviewDateTime('')
          setScheduleChangeReason('')
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error))
        },
      }
    )
  }

  const handleOpenChangeSchedule = (applicationId: string) => {
    setChangeFormApplicationId(applicationId)
    setPreferredInterviewDateTime('')
    setScheduleChangeReason('')
  }

  const handleCloseChangeSchedule = () => {
    if (changeScheduleMutation.isPending) return
    setChangeFormApplicationId(null)
    setPreferredInterviewDateTime('')
    setScheduleChangeReason('')
  }

  const changingApplication = applications.find((app) => app.id === changeFormApplicationId)

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
    <div className="space-y-6 animate-fade-in">

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
            const isSelected = selectedApplicationId === app.id
            const hasInterviewSchedule = Boolean(app.interviewDateTime)
            const canRespondToSchedule = hasInterviewSchedule && app.status === ApplicationStatus.PENDING_INTERVIEW_SCHEDULE
            const isWaitingForRescheduleReview = app.status === ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE
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
                onClick={() => setSelectedApplicationId(isSelected ? null : app.id)}
                className={`group relative bg-white rounded-2xl border p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:border-blue-200/80 hover:-translate-y-0.5 cursor-pointer ${
                  isSelected ? 'border-blue-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)]' : 'border-slate-200/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4.5 flex-1 min-w-0">
                    <CompanyLogo url={companyLogo} name={companyName} />

                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div>
                        <Link
                          href={`/jobs/${app.jobId}`}
                          onClick={(event) => event.stopPropagation()}
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
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-450 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100/40">
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
                        {hasInterviewSchedule && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50/70 px-2.5 py-0.5 rounded-lg border border-indigo-100/50">
                            <CalendarCheck2 className="h-3.5 w-3.5" />
                            Lịch PV: {formatDateTime(app.interviewDateTime)}
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
                      onClick={(event) => {
                        event.stopPropagation()
                        setMatchApp({
                          cvId: app.cvId,
                          jobId: app.jobId,
                          jobTitle: app.jobTitle,
                          companyName: companyName,
                        })
                      }}
                      className="flex items-center justify-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-all border border-indigo-200/50 shadow-xs"
                      title="Đánh giá mức độ phù hợp bằng AI"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">AI Đánh giá</span>
                    </button>

                    <Link
                      href={`/jobs/${app.jobId}`}
                      onClick={(event) => event.stopPropagation()}
                      className="flex items-center justify-center gap-1 text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50/40 hover:bg-blue-50/80 px-4 py-2.5 rounded-xl transition-all border border-blue-100/30 hover:border-blue-200/50 group/btn shadow-xs hover:shadow-sm"
                    >
                      Xem chi tiết
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </div>

                {isSelected && hasInterviewSchedule && (
                  <div
                    className="mt-5 border-t border-slate-100 pt-5 space-y-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-slate-50/70 border border-slate-100 p-4">
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          Lịch phỏng vấn đề xuất
                        </p>
                        <p className="text-sm font-extrabold text-slate-800">
                          {formatDateTime(app.interviewDateTime)}
                        </p>
                        {app.candidatePreferredInterviewDateTime && (
                          <p className="text-xs font-semibold text-amber-600">
                            Đã yêu cầu đổi sang: {formatDateTime(app.candidatePreferredInterviewDateTime)}
                          </p>
                        )}
                      </div>

                      {canRespondToSchedule ? (
                        <div className="flex flex-col sm:flex-row gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() => handleAcceptSchedule(app.id)}
                            disabled={acceptScheduleMutation.isPending || changeScheduleMutation.isPending}
                            className="inline-flex items-center justify-center gap-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl transition-all shadow-xs"
                          >
                            {acceptScheduleMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            Accept schedule
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenChangeSchedule(app.id)}
                            disabled={acceptScheduleMutation.isPending || changeScheduleMutation.isPending}
                            className="inline-flex items-center justify-center gap-2 text-xs font-black text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 rounded-xl transition-all border border-amber-100"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Change schedule
                          </button>
                        </div>
                      ) : isWaitingForRescheduleReview ? (
                        <span className="inline-flex items-center gap-2 text-xs font-black text-cyan-700 bg-cyan-50 border border-cyan-100 px-3 py-2 rounded-xl self-start">
                          <RefreshCw className="h-4 w-4" />
                          Bạn đã gửi yêu cầu đổi lịch phỏng vấn. Vui lòng chờ nhà tuyển dụng phản hồi.
                        </span>
                      ) : app.status === ApplicationStatus.INTERVIEW ? (
                        <span className="inline-flex items-center gap-2 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl self-start">
                          <CheckCircle2 className="h-4 w-4" />
                          Lịch phỏng vấn đã được xác nhận
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-xs font-black text-slate-600 bg-white border border-slate-100 px-3 py-2 rounded-xl self-start">
                          <CalendarCheck2 className="h-4 w-4" />
                          Đã có lịch phỏng vấn
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {totalElements >= 10 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalElements}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}

      <ApplicationMatchModal
        isOpen={!!matchApp}
        onClose={() => setMatchApp(null)}
        cvId={matchApp?.cvId || ''}
        jobId={matchApp?.jobId || ''}
        jobTitle={matchApp?.jobTitle || ''}
        companyName={matchApp?.companyName || ''}
      />

      {changingApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm"
          onClick={handleCloseChangeSchedule}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900">Change schedule</h2>
                <p className="text-xs font-semibold text-slate-500">
                  {changingApplication.jobTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseChangeSchedule}
                disabled={changeScheduleMutation.isPending}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-60"
                aria-label="Close change schedule popup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {changingApplication.interviewDateTime && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-indigo-500">
                    Current interview schedule
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-800">
                    {formatDateTime(changingApplication.interviewDateTime)}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="preferred-interview-date-time" className="block text-xs font-black uppercase tracking-wider text-slate-600">
                  New preferred date/time
                </label>
                <input
                  id="preferred-interview-date-time"
                  type="datetime-local"
                  value={preferredInterviewDateTime}
                  onChange={(event) => setPreferredInterviewDateTime(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="schedule-change-reason" className="block text-xs font-black uppercase tracking-wider text-slate-600">
                  Reason
                </label>
                <textarea
                  id="schedule-change-reason"
                  value={scheduleChangeReason}
                  onChange={(event) => setScheduleChangeReason(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                  placeholder="Nhập lý do bạn muốn đổi lịch phỏng vấn"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseChangeSchedule}
                disabled={changeScheduleMutation.isPending}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmitChangeSchedule(changingApplication.id)}
                disabled={changeScheduleMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-black text-white shadow-xs transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changeScheduleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
