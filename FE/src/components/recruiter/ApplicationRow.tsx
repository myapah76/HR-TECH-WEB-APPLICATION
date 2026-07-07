import React, { useState, useEffect, useCallback } from 'react'
import { Clock, FileText, Eye } from 'lucide-react'
import { ApplicationStatus, ApplicationSummaryResponse } from '@/src/types'

// ─── Status config ────────────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<
    ApplicationStatus,
    { label: string; color: string; bg: string; dot: string }
> = {
    [ApplicationStatus.SUBMITTED]: {
        label: 'Mới nộp',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        dot: 'bg-blue-500',
    },
    [ApplicationStatus.SCORED]: {
        label: 'Đã chấm',
        color: 'text-violet-700',
        bg: 'bg-violet-50',
        dot: 'bg-violet-500',
    },
    [ApplicationStatus.PENDING_INTERVIEW_SCHEDULE]: {
        label: 'CHỜ LỊCH PHỎNG VẤN',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        dot: 'bg-orange-500',
    },
    [ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE]: {
        label: 'ỨNG VIÊN XIN ĐỔI LỊCH',
        color: 'text-cyan-700',
        bg: 'bg-cyan-50',
        dot: 'bg-cyan-500',
    },
    [ApplicationStatus.INTERVIEW]: {
        label: 'PHỎNG VẤN',
        color: 'text-indigo-700',
        bg: 'bg-indigo-50',
        dot: 'bg-indigo-500',
    },

    [ApplicationStatus.INTERVIEW_COMPLETED]: {
        label: 'ĐÃ PHỎNG VẤN',
        color: 'text-teal-700',
        bg: 'bg-teal-50',
        dot: 'bg-teal-500',
    },
    [ApplicationStatus.NO_SHOW]: {
        label: 'KHÔNG THAM GIA',
        color: 'text-gray-700',
        bg: 'bg-gray-100',
        dot: 'bg-gray-500',
    },
    [ApplicationStatus.ACCEPTED]: {
        label: 'ĐÃ NHẬN',
        color: 'text-green-700',
        bg: 'bg-green-50',
        dot: 'bg-green-500',
    },

    [ApplicationStatus.REJECTED]: {
        label: 'TỪ CHỐI',
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        dot: 'bg-rose-500',
    },
    [ApplicationStatus.WITHDRAWN]: {
        label: 'Đã rút',
        color: 'text-slate-600',
        bg: 'bg-slate-100',
        dot: 'bg-slate-400',
    },
};

export const FILTER_STATUS_OPTIONS: { value: ApplicationStatus | ''; label: string }[] = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: ApplicationStatus.SUBMITTED, label: 'Mới nộp' },
    { value: ApplicationStatus.SCORED, label: 'Đã chấm điểm AI' },
    { value: ApplicationStatus.PENDING_INTERVIEW_SCHEDULE, label: 'Chờ lịch phỏng vấn' },
    { value: ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE, label: 'Ứng viên xin đổi lịch' },
    { value: ApplicationStatus.INTERVIEW, label: 'Phỏng vấn' },

    { value: ApplicationStatus.INTERVIEW_COMPLETED, label: 'Đã phỏng vấn' },
    { value: ApplicationStatus.NO_SHOW, label: 'Không tham gia' },
    { value: ApplicationStatus.ACCEPTED, label: 'Đã nhận' },

    { value: ApplicationStatus.REJECTED, label: 'Từ chối' },
    { value: ApplicationStatus.WITHDRAWN, label: 'Đã rút' },
];
// ─── Helpers ──────────────────────────────────────────────────────────────────
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
    // Update every 30s
    const id = setInterval(() => setLabel(compute()), 30_000)
    return () => clearInterval(id)
  }, [compute])

  return label
}

export function RelativeTime({ dateStr }: { dateStr: string }) {
  const label = useRelativeTime(dateStr)
  return (
    <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

interface ApplicationRowProps {
  app: ApplicationSummaryResponse
  onViewDetail: (app: ApplicationSummaryResponse) => void
}

export function ApplicationRow({ app, onViewDetail }: ApplicationRowProps) {
  const initials = app.cvTitle?.slice(0, 2).toUpperCase() || 'UV'
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
  const colorIdx = app.id.charCodeAt(0) % colors.length

  return (
    <tr
      className="group hover:bg-slate-50/80 transition-colors duration-150 cursor-pointer"
      onClick={() => onViewDetail(app)}
    >
      {/* Avatar + CV */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl ${colors[colorIdx]} flex items-center justify-center text-white text-xs font-black shrink-0`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate max-w-45">{app.cvTitle}</p>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
              <FileText className="w-3 h-3" />
              CV đính kèm
            </p>
          </div>
        </div>
      </td>

      {/* Job */}
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-slate-700 truncate max-w-50">{app.jobTitle}</p>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <StatusBadge status={app.status} />
      </td>

      {/* Applied */}
      <td className="px-4 py-4">
        <RelativeTime dateStr={app.appliedAt} />
      </td>

      {/* Action */}
      <td className="px-4 py-4">
        <button
          id={`view-app-${app.id}`}
          onClick={(e) => {
            e.stopPropagation()
            onViewDetail(app)
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-600 hover:shadow-md active:scale-95 transition-all duration-150"
        >
          <Eye className="w-3.5 h-3.5" />
          Xem
        </button>
      </td>
    </tr>
  )
}
