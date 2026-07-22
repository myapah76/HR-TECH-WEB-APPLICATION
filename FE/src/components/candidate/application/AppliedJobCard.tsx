'use client'

import React from 'react'
import Link from 'next/link'
import {
  Clock,
  Loader2,
  MapPin,
  DollarSign,
  ArrowRight,
  FileText,
  Sparkles,
  Brain,
  CalendarCheck2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { CompanyLogo } from '@/src/components/jobs/CompanyLogo'
import { ApplicationStatus } from '@/src/types'
import { formatDate, formatDateTime, formatSalary } from '@/src/utils'
import CandidateInterviewRoundsSection from '@/src/components/candidate/application/CandidateInterviewRoundsSection'

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

interface AppliedJobCardProps {
  app: any
  jobDetail: any
  isSelected: boolean
  isScoring: boolean
  onSelect: () => void
  onOpenScoreDetail: (appId: string) => void
  onConfirmScore: (appId: string) => void
  onOpenChangeSchedule: (appId: string, roundNumber: number) => void
}

export default function AppliedJobCard({
  app,
  jobDetail,
  isSelected,
  isScoring,
  onSelect,
  onOpenScoreDetail,
  onConfirmScore,
  onOpenChangeSchedule,
}: AppliedJobCardProps) {
  const companyName = jobDetail?.companyName || 'Công ty ẩn danh'
  const companyLogo = jobDetail?.companyLogoUrl || null
  const location = jobDetail?.location || 'Chưa cập nhật'
  const hasInterviewSchedule =
    Boolean(app.scheduledTime) ||
    Boolean(app.interviewDateTime) ||
    app.status === ApplicationStatus.INTERVIEW ||
    (Array.isArray(app.interviewRounds) && app.interviewRounds.length > 0) ||
    (app.status as string) === 'SLOTS_SENT' ||
    (app.status as string) === 'RESCHEDULE_REQUESTED' ||
    (app.status as string) === 'RESCHEDULE_REJECTED' ||
    (app.status as string) === 'PENDING_INTERVIEW_SCHEDULE' ||
    (app.status as string) === 'CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE'

  const statusInfo = statusConfig[app.status] || {
    label: app.status,
    bg: 'bg-slate-50',
    text: 'text-slate-650',
    border: 'border-slate-200/40',
  }

  const salaryText = formatSalary(jobDetail?.salaryMin, jobDetail?.salaryMax, jobDetail?.salaryType)

  return (
    <div
      onClick={hasInterviewSchedule ? onSelect : undefined}
      className={`group relative bg-white rounded-2xl border p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:border-blue-200/80 ${
        hasInterviewSchedule ? 'cursor-pointer' : ''
      } ${
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
                onClick={(e) => e.stopPropagation()}
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
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect()
                  }}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-xl transition-all cursor-pointer border shadow-2xs ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : app.scheduledTime || app.interviewDateTime
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100 animate-pulse'
                  }`}
                  title="Bấm để đóng/mở chi tiết các vòng phỏng vấn"
                >
                  <CalendarCheck2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {app.scheduledTime || app.interviewDateTime
                      ? `Lịch PV: ${formatDateTime(app.scheduledTime || app.interviewDateTime)}`
                      : isSelected
                      ? 'Tiến trình phỏng vấn (Đang xem)'
                      : 'Lịch phỏng vấn (Bấm để xem/chọn)'}
                  </span>
                  {isSelected ? (
                    <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  )}
                </button>
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

          {app.overallScore !== undefined && app.overallScore !== null ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenScoreDetail(app.id)
              }}
              className="flex items-center justify-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-2 rounded-xl transition-all border border-emerald-200/80 shadow-xs cursor-pointer"
              title="Xem chi tiết đánh giá AI"
            >
              <Brain className="h-4 w-4 text-emerald-600" />
              <span>
                AI: {app.overallScore}% ({app.grade})
              </span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (isScoring) return
                onConfirmScore(app.id)
              }}
              disabled={isScoring}
              className={`flex items-center justify-center gap-1.5 text-xs font-black text-indigo-650 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-all border border-indigo-200/50 shadow-xs cursor-pointer ${
                isScoring ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="Chấm điểm hồ sơ này bằng AI"
            >
              {isScoring ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>AI Chấm điểm</span>
            </button>
          )}

          <Link
            href={`/jobs/${app.jobId}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50/40 hover:bg-blue-50/80 px-4 py-2.5 rounded-xl transition-all border border-blue-100/30 hover:border-blue-200/50 group/btn shadow-xs hover:shadow-sm"
          >
            Xem chi tiết
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {isSelected && hasInterviewSchedule && (
        <div onClick={(e) => e.stopPropagation()}>
          <CandidateInterviewRoundsSection
            applicationId={app.id}
            jobTitle={app.jobTitle}
            enabled={hasInterviewSchedule}
            onOpenChangeSchedule={(roundNum) => onOpenChangeSchedule(app.id, roundNum)}
          />
        </div>
      )}
    </div>
  )
}
