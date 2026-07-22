'use client'

import React from 'react'
import {
  Clock,
  ExternalLink,
  Link as LinkIcon,
  MapPin,
  Layers,
} from 'lucide-react'
import { ApplicationDetailResponse } from '@/src/types'
import { formatDateTime } from '@/src/utils'
import { StatusBadge } from '@/src/components/recruiter/applications/ApplicationRow'
import InterviewQuickActions from '@/src/components/recruiter/interview-schedules/InterviewQuickActions'

function DetailLine({ icon: Icon, text }: { icon: typeof MapPin; text?: string }) {
  if (!text) return null
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      {text}
    </p>
  )
}

export interface InterviewSchedulesListViewProps {
  schedules: ApplicationDetailResponse[]
  getWarning: (app: ApplicationDetailResponse) => { label: string; className: string }
  isActionPending?: boolean
  onAcceptReschedule?: (id: string) => void
  onRejectReschedule?: (id: string) => void
}

export default function InterviewSchedulesListView({
  schedules,
  getWarning,
}: InterviewSchedulesListViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-black uppercase text-slate-500">
            <th className="px-4 py-3">Ứng viên &amp; CV</th>
            <th className="px-4 py-3">Vị trí tuyển dụng</th>
            <th className="px-4 py-3">Vòng phỏng vấn</th>
            <th className="px-4 py-3">Lịch phỏng vấn</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {schedules.map((app) => {
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

            return (
              <tr key={app.id} className="hover:bg-slate-50/50 transition">
                <td className="px-4 py-4 align-top">
                  <p className="text-sm font-black text-slate-900">
                    {app.candidateName || 'Candidate'}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    CV: {app.cvTitle}
                  </p>
                </td>
                <td className="px-4 py-4 align-top">
                  <p className="text-sm font-bold text-slate-700">{app.jobTitle}</p>
                </td>
                <td className="px-4 py-4 align-top">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    {activeRoundName}
                  </span>
                </td>
                <td className="px-4 py-4 align-top min-w-64">
                  <p className="text-sm font-black text-slate-800">
                    {interviewTime
                      ? formatDateTime(interviewTime)
                      : 'Chưa có lịch chính thức'}
                  </p>
                  <div className="mt-2 space-y-1">
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
                  {(roundStatus === 'RESCHEDULE_REQUESTED' || (app.status as string) === 'RESCHEDULE_REQUESTED' || app.candidatePreferredInterviewDateTime != null) && (
                    <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                      <p className="text-xs font-black text-cyan-700">Candidate đề xuất</p>
                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {formatDateTime(app.candidatePreferredInterviewDateTime!)}
                      </p>
                      {app.candidateInterviewResponseMessage && (
                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          Lý do: {app.candidateInterviewResponseMessage}
                        </p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 align-top space-y-2">
                  <span
                    className={`inline-block rounded-xl border px-2.5 py-1 text-[11px] font-bold ${warning.className}`}
                  >
                    {warning.label}
                  </span>
                </td>
                <td className="px-4 py-4 align-top text-right">
                  <InterviewQuickActions app={app} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
