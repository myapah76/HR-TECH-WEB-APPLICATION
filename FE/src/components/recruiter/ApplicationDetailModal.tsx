'use client'

import { useEffect, useRef, useState, useCallback, type FormEvent } from 'react'
import {
  X,
  FileText,
  Briefcase,
  Clock,
  Brain,
  MessageSquare,
  Lightbulb,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  CalendarClock,
  MapPin,
  Link as LinkIcon,
} from 'lucide-react'
import { useGetApplicationDetail } from '@/src/hooks/application'
import { useGetCvDetail } from '@/src/hooks/cv'
import { ApplicationStatus, ScheduleInterviewRequest } from '@/src/types'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  [ApplicationStatus.SUBMITTED]: { label: 'Mới nộp', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
  [ApplicationStatus.SCORED]: { label: 'Đã chấm', color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200', dot: 'bg-violet-500' },
  [ApplicationStatus.PENDING_INTERVIEW_SCHEDULE]: { label: 'CHỜ LỊCH PHỎNG VẤN', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  [ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE]: { label: 'ỨNG VIÊN XIN ĐỔI LỊCH', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  [ApplicationStatus.INTERVIEW]: { label: 'PHỎNG VẤN', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  [ApplicationStatus.REJECTED]: { label: 'TỪ CHỐI', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500' },
  [ApplicationStatus.WITHDRAWN]: { label: 'Đã rút', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', dot: 'bg-slate-400' },
}

const NEXT_ACTIONS: Partial<Record<ApplicationStatus, { status: ApplicationStatus; label: string; style: string }[]>> = {
  [ApplicationStatus.SUBMITTED]: [
    { status: ApplicationStatus.INTERVIEW, label: 'Lên lịch Phỏng vấn', style: 'bg-indigo-500 hover:bg-indigo-600 text-white' },
    { status: ApplicationStatus.REJECTED, label: 'Từ chối', style: 'bg-rose-500 hover:bg-rose-600 text-white' },
  ],
  [ApplicationStatus.SCORED]: [
    { status: ApplicationStatus.INTERVIEW, label: 'Mời Phỏng vấn', style: 'bg-indigo-500 hover:bg-indigo-600 text-white' },
    { status: ApplicationStatus.REJECTED, label: 'Từ chối', style: 'bg-rose-500 hover:bg-rose-600 text-white' },
  ]
}

function gradeColor(grade?: string) {
  if (!grade) return 'text-slate-500'
  if (grade === 'A+' || grade === 'A') return 'text-emerald-600'
  if (grade === 'B+' || grade === 'B') return 'text-blue-600'
  if (grade === 'C+' || grade === 'C') return 'text-amber-600'
  return 'text-rose-600'
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#6366f1' : pct >= 40 ? '#f59e0b' : '#f43f5e'

  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
      <circle
        cx="48" cy="48" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 48 48)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="48" y="44" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f172a">{pct}</text>
      <text x="48" y="58" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">/ 100</text>
    </svg>
  )
}

function calcTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds} giây trước`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  return `${Math.floor(hours / 24)} ngày trước`
}

function useRelativeTime(dateStr: string) {
  const compute = useCallback(() => calcTimeAgo(dateStr), [dateStr])
  const [label, setLabel] = useState(compute)
  useEffect(() => {
    setLabel(compute())
    const id = setInterval(() => setLabel(compute()), 30_000)
    return () => clearInterval(id)
  }, [compute])
  return label
}

function toDateTimeLocalValue(dateStr?: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  const offsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  applicationId: string
  onClose: () => void
  onStatusChange: (id: string, status: ApplicationStatus) => void
  onScheduleInterview: (id: string, request: ScheduleInterviewRequest) => void
  onAcceptCandidateReschedule: (id: string) => void
  onRejectCandidateReschedule: (id: string) => void
  isSchedulingInterview?: boolean
  isReviewingCandidateReschedule?: boolean
}

export default function ApplicationDetailModal({
  applicationId,
  onClose,
  onStatusChange,
  onScheduleInterview,
  onAcceptCandidateReschedule,
  onRejectCandidateReschedule,
  isSchedulingInterview = false,
  isReviewingCandidateReschedule = false,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [interviewDateTime, setInterviewDateTime] = useState('')
  const [interviewLocation, setInterviewLocation] = useState('')
  const [interviewMeetingLink, setInterviewMeetingLink] = useState('')
  const [interviewNote, setInterviewNote] = useState('')
  const { data: app, isLoading } = useGetApplicationDetail(applicationId)
  const { data: cvDetail, isLoading: isCvLoading } = useGetCvDetail(app?.cvId ?? '', !!app?.cvId)
  // Hook ở component level (tuân thủ Rules of Hooks)
  const relativeTime = useRelativeTime(app?.appliedAt ?? '')

  const handleViewCv = () => {
    if (cvDetail?.fileUrl) {
      window.open(cvDetail.fileUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Close on Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const cfg = app ? STATUS_CONFIG[app.status] : null
  const nextActions = app ? (NEXT_ACTIONS[app.status] ?? []) : []

  useEffect(() => {
    if (app?.status === ApplicationStatus.PENDING_INTERVIEW_SCHEDULE) {
      setIsScheduleOpen(false)
    }
  }, [app?.status])

  const openScheduleForm = (prefill = false) => {
    if (prefill && app) {
        setInterviewDateTime(
            toDateTimeLocalValue(
                app.candidatePreferredInterviewDateTime || app.interviewDateTime
            )
        )
      setInterviewLocation(app.interviewLocation ?? '')
      setInterviewMeetingLink(app.interviewMeetingLink ?? '')
      setInterviewNote(app.interviewNote ?? '')
    } else {
      setInterviewDateTime('')
      setInterviewLocation('')
      setInterviewMeetingLink('')
      setInterviewNote('')
    }
    setIsScheduleOpen(true)
  }

  const handleActionClick = (status: ApplicationStatus) => {
    if (status === ApplicationStatus.INTERVIEW && app?.status !== ApplicationStatus.PENDING_INTERVIEW_SCHEDULE) {
      openScheduleForm(false)
      return
    }
    if (app) onStatusChange(app.id, status)
  }

  const handleScheduleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!app || !interviewDateTime || (!interviewLocation.trim() && !interviewMeetingLink.trim())) return

    onScheduleInterview(app.id, {
      interviewDateTime: new Date(interviewDateTime).toISOString(),
      interviewLocation: interviewLocation.trim() || undefined,
      interviewMeetingLink: interviewMeetingLink.trim() || undefined,
      note: interviewNote.trim() || undefined,
    })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        id="application-detail-modal"
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ animation: 'slideUp 0.25s ease' }}
      >
        {/* ─── Top bar ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-black text-slate-900">Chi tiết hồ sơ</h2>
          <button
            id="close-detail-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* ─── Body ──────────────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm font-semibold text-slate-500">Đang tải chi tiết...</p>
            </div>
          ) : !app ? (
            <p className="text-center text-sm text-slate-500 py-10">Không tìm thấy hồ sơ</p>
          ) : (
            <>
              {/* ── Info header ────────────────────────────────────────────────── */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-black shrink-0">
                  {app.cvTitle?.slice(0, 2).toUpperCase() || 'UV'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-slate-900 truncate">{app.cvTitle}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <Briefcase className="w-3.5 h-3.5" />
                      {app.jobTitle}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {relativeTime}
                    </span>
                  </div>
                  {/* CV viewer button */}
                  <div className="mt-2.5">
                    {isCvLoading ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Đang tải CV...
                      </span>
                    ) : cvDetail?.fileUrl ? (
                      <button
                        id="view-cv-file"
                        onClick={handleViewCv}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-sm hover:shadow-md active:scale-95 transition-all duration-150"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Xem CV
                        <ExternalLink className="w-3 h-3 opacity-75" />
                      </button>
                    ) : (
                      <span
                        title="File CV chưa được đính kèm"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Chưa có file CV
                      </span>
                    )}
                  </div>
                </div>
                {cfg && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                )}
              </div>

              {/* ── Cover Letter ──────────────────────────────────────────────── */}
              {app.coverLetter && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <h3 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Thư giới thiệu
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{app.coverLetter}</p>
                </div>
              )}

              {/* ── AI Score Panel ────────────────────────────────────────────── */}
              {app.overallScore !== undefined && app.overallScore !== null ? (
                <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5">
                  <h3 className="flex items-center gap-2 text-xs font-black text-violet-600 uppercase tracking-wider mb-4">
                    <Brain className="w-3.5 h-3.5" />
                    Đánh giá AI
                  </h3>
                  <div className="flex items-center gap-6">
                    <ScoreRing score={app.overallScore} />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-black ${gradeColor(app.grade)}`}>{app.grade || '—'}</span>
                        <span className="text-sm font-semibold text-slate-500">Xếp loại</span>
                      </div>
                      {app.aiSummary && (
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{app.aiSummary}</p>
                      )}
                    </div>
                  </div>

                  {app.aiSuggestion && (
                    <div className="mt-4 pt-4 border-t border-violet-100">
                      <h4 className="flex items-center gap-1.5 text-xs font-black text-violet-600 mb-2">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Gợi ý từ AI
                      </h4>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">{app.aiSuggestion}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-600">Chưa có điểm AI</p>
                    <p className="text-xs text-slate-400 mt-0.5">Hệ thống đang phân tích hồ sơ này</p>
                  </div>
                </div>
              )}

              {/* ── Status Actions ────────────────────────────────────────────── */}
              {nextActions.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                    Chuyển trạng thái
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {nextActions.map((action) => (
                      <button
                        key={action.status}
                        id={`action-${action.status.toLowerCase()}`}
                        onClick={() => handleActionClick(action.status)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${action.style}`}
                      >
                        {action.label}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {app.status === ApplicationStatus.PENDING_INTERVIEW_SCHEDULE && (
                <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 space-y-2">
                  <h3 className="flex items-center gap-2 text-xs font-black text-orange-700 uppercase tracking-wider">
                    <CalendarClock className="w-3.5 h-3.5" />
                    Lịch phỏng vấn đã gửi
                  </h3>
                  {app.interviewDateTime && (
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(app.interviewDateTime).toLocaleString('vi-VN')}
                    </p>
                  )}
                  {app.interviewLocation && (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      {app.interviewLocation}
                    </p>
                  )}
                  {app.interviewMeetingLink && (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <LinkIcon className="w-4 h-4 text-orange-500" />
                      {app.interviewMeetingLink}
                    </p>
                  )}
                </div>
              )}

              {app.status === ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE && (
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 space-y-4">
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-xs font-black text-cyan-700 uppercase tracking-wider">
                      <CalendarClock className="w-3.5 h-3.5" />
                      Ứng viên yêu cầu đổi lịch
                    </h3>
                    {app.interviewDateTime && (
                      <p className="text-sm font-semibold text-slate-600">
                        Lịch hiện tại: {new Date(app.interviewDateTime).toLocaleString('vi-VN')}
                      </p>
                    )}
                    {app.candidatePreferredInterviewDateTime && (
                      <p className="text-sm font-black text-slate-800">
                        Lịch ứng viên đề xuất: {new Date(app.candidatePreferredInterviewDateTime).toLocaleString('vi-VN')}
                      </p>
                    )}
                    {app.candidateInterviewResponseMessage && (
                      <div className="rounded-xl bg-white/70 border border-cyan-100 p-3">
                        <p className="text-xs font-black text-cyan-700 uppercase tracking-wider mb-1">Lý do</p>
                        <p className="text-sm font-medium text-slate-700">{app.candidateInterviewResponseMessage}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => onAcceptCandidateReschedule(app.id)}
                      disabled={isReviewingCandidateReschedule}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isReviewingCandidateReschedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Accept new schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => onRejectCandidateReschedule(app.id)}
                      disabled={isReviewingCandidateReschedule}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject new schedule
                    </button>
                  </div>
                </div>
              )}

              {/* ── Completed states ─────────────────────────────────────────── */}
              {app.status === ApplicationStatus.REJECTED && (
                <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-4">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <p className="text-sm font-bold text-rose-600">Hồ sơ đã bị từ chối</p>
                </div>
              )}
              {app.status === ApplicationStatus.WITHDRAWN && (
                <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 rounded-2xl p-4">
                  <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
                  <p className="text-sm font-bold text-slate-600">Ứng viên đã rút hồ sơ</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isScheduleOpen && app && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50">
          <form
            onSubmit={handleScheduleSubmit}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Lên lịch phỏng vấn</h3>
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Thời gian phỏng vấn</span>
                <input
                  id="interview-date-time"
                  type="datetime-local"
                  required
                  value={interviewDateTime}
                  onChange={(e) => setInterviewDateTime(e.target.value)}
                  className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Địa điểm</span>
                <input
                  id="interview-location"
                  type="text"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                  placeholder="VD: Văn phòng công ty, tầng 5"
                  className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Meeting link</span>
                <input
                  id="interview-meeting-link"
                  type="url"
                  value={interviewMeetingLink}
                  onChange={(e) => setInterviewMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </label>

              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Ghi chú</span>
                <textarea
                  id="interview-note"
                  value={interviewNote}
                  onChange={(e) => setInterviewNote(e.target.value)}
                  rows={3}
                  placeholder="Thông tin cần chuẩn bị, người liên hệ..."
                  className="mt-2 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSchedulingInterview || !interviewDateTime || (!interviewLocation.trim() && !interviewMeetingLink.trim())}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSchedulingInterview && <Loader2 className="w-4 h-4 animate-spin" />}
                Gửi lịch phỏng vấn
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
