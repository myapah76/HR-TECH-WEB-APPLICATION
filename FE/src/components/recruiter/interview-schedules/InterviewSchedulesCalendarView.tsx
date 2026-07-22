'use client'

import React from 'react'
import {
  CalendarClock,
  Clock,
  ExternalLink,
  Link as LinkIcon,
  MapPin,
} from 'lucide-react'
import { ApplicationDetailResponse } from '@/src/types'
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

export interface InterviewSchedulesCalendarViewProps {
  calendarGroups: InterviewDateGroup[]
  getWarning: (app: ApplicationDetailResponse) => { label: string; className: string }
  isActionPending: boolean
  onAcceptReschedule: (id: string) => void
  onRejectReschedule: (id: string) => void
}

export default function InterviewSchedulesCalendarView({
  calendarGroups,
  getWarning,
  isActionPending,
  onAcceptReschedule,
  onRejectReschedule,
}: InterviewSchedulesCalendarViewProps) {
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
              const interviewTime = app.interviewDateTime || app.candidatePreferredInterviewDateTime

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">{app.jobTitle}</p>
                        <h3 className="text-sm font-black text-slate-900 mt-0.5">
                          {app.candidateName || app.cvTitle}
                        </h3>
                      </div>
                      <StatusBadge status={app.status} />
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
                    <InterviewQuickActions
                      app={app}
                      isPending={isActionPending}
                      onAcceptReschedule={onAcceptReschedule}
                      onRejectReschedule={onRejectReschedule}
                    />
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
