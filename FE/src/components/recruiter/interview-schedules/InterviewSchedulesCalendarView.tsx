'use client'

import React from 'react'
import {
  CalendarClock,
  Clock,
  ExternalLink,
  Link as LinkIcon,
  MapPin,
  Layers,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ApplicationDetailResponse, ApplicationStatus } from '@/src/types'
import { formatDateTime, formatTimeOnly } from '@/src/utils'
import { StatusBadge } from '@/src/components/recruiter/applications/ApplicationRow'
import InterviewQuickActions from '@/src/components/recruiter/interview-schedules/InterviewQuickActions'

export type InterviewDateGroup = {
  key: string
  label: string
  items: ApplicationDetailResponse[]
}

function DetailLine({ icon: Icon, text }: { icon: typeof MapPin; text?: string }) {
  if (!text) return null
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      {text}
    </p>
  )
}

function InterviewRoundStatusBadge({ status }: { status?: string }) {
  if (status === 'INTERVIEW_COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
        Hoàn Thành Các Vòng
      </span>
    )
  }
  if (status === 'CONFIRMED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
        Đã Chốt Lịch
      </span>
    )
  }
  if (status === 'ATTENDED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/40 text-[11px] font-bold text-teal-700 dark:text-teal-300 shrink-0">
        Đã Tham Dự (Chờ Chấm)
      </span>
    )
  }
  if (status === 'PASSED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-[11px] font-bold text-blue-700 dark:text-blue-300 shrink-0">
        Đã Đạt Vòng
      </span>
    )
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-[11px] font-bold text-rose-700 dark:text-rose-300 shrink-0">
        Loại / Không Đạt
      </span>
    )
  }
  if (status === 'SLOTS_SENT') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[11px] font-bold text-amber-700 dark:text-amber-300 shrink-0">
        Đã Gửi Lịch
      </span>
    )
  }
  if (status === 'RESCHEDULE_REQUESTED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900/40 text-[11px] font-bold text-cyan-700 dark:text-cyan-300 shrink-0">
        Candidate Đổi Lịch
      </span>
    )
  }
  return <StatusBadge status={ApplicationStatus.INTERVIEW} />
}

export interface InterviewSchedulesCalendarViewProps {
  calendarGroups: InterviewDateGroup[]
  getWarning: (app: ApplicationDetailResponse) => { label: string; className: string }
  isActionPending?: boolean
  onAcceptReschedule?: (id: string) => void
  onRejectReschedule?: (id: string) => void
}

export default function InterviewSchedulesCalendarView({
  calendarGroups,
  getWarning,
}: InterviewSchedulesCalendarViewProps) {
  const router = useRouter()

  return (
    <div className="space-y-4 p-4">
      {calendarGroups.map((group) => (
        <section
          key={group.key}
          className="rounded-2xl border border-slate-200/70 bg-slate-50/60 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-black text-slate-800">
              <CalendarClock className="h-4 w-4 text-emerald-600" />
              {group.label}
            </h2>
            <span className="text-xs font-black text-slate-500">{group.items.length} buổi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {group.items.map((app) => {
              const warning = getWarning(app)
              const latestRound =
                (app as any).interviewRounds && (app as any).interviewRounds.length > 0
                  ? (app as any).interviewRounds[(app as any).interviewRounds.length - 1]
                  : null

              const interviewTime =
                latestRound?.scheduledTime || app.interviewDateTime || app.candidatePreferredInterviewDateTime

              const activeRoundName = latestRound
                ? latestRound.roundName || `Vòng ${latestRound.roundNumber}`
                : (app as any).roundName || 'Vòng 1'

              const roundStatus = latestRound?.status || app.interviewRoundStatus

              const handleCardClick = () => {
                if (app.jobId) {
                  router.push(`/recruiter/manage-jobs/${app.jobId}/interviews?appId=${app.id}`)
                }
              }

              return (
                <div
                  key={app.id}
                  onClick={handleCardClick}
                  className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200 dark:border-indigo-800">
                            <Layers className="w-3 h-3 text-indigo-600" />
                            {activeRoundName}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">{app.jobTitle}</p>
                        <h3 className="text-sm font-black text-slate-900 mt-0.5">
                          {app.candidateName || app.cvTitle}
                        </h3>
                      </div>
                      <InterviewRoundStatusBadge status={roundStatus} />
                    </div>

                    <div className="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3 space-y-1.5">
                      <p className="text-xs font-black text-slate-700">
                        {interviewTime ? formatDateTime(interviewTime) : 'Chưa xếp giờ'}
                      </p>

                      <DetailLine icon={MapPin} text={app.interviewLocation} />

                      {app.interviewMeetingLink && (
                        <a
                          href={app.interviewMeetingLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          Meeting link
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      <DetailLine icon={Clock} text={app.interviewNote} />
                    </div>

                    {((app.status as string) === 'RESCHEDULE_REQUESTED' || app.candidatePreferredInterviewDateTime != null) && (
                      <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3 space-y-1">
                        <p className="text-xs font-black text-cyan-700">Candidate xin đổi lịch</p>
                        <p className="text-xs font-bold text-slate-700">
                          Lịch mới:{' '}
                          {app.candidatePreferredInterviewDateTime
                            ? formatDateTime(app.candidatePreferredInterviewDateTime)
                            : 'N/A'}
                        </p>
                        {app.candidateInterviewResponseMessage && (
                          <p className="text-xs font-semibold text-slate-600">
                            Lý do: {app.candidateInterviewResponseMessage}
                          </p>
                        )}
                      </div>
                    )}

                    <span
                      className={`inline-block rounded-xl border px-2.5 py-1 text-[11px] font-bold ${warning.className}`}
                    >
                      {warning.label}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {interviewTime ? formatTimeOnly(interviewTime) : '--:--'}
                    </span>
                    <InterviewQuickActions app={app} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
