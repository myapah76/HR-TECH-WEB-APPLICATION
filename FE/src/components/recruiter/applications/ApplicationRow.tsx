import React, { useState } from 'react'
import { Clock, FileText, Eye, Brain, Sparkles, Loader2 } from 'lucide-react'
import { ApplicationStatus, ApplicationSummaryResponse } from '@/src/types'
import { useScoreApplication } from '@/src/hooks/application'
import { useRelativeTime } from '@/src/hooks/useRelativeTime'
import { toast } from 'sonner'
import { calcTimeAgo, getErrorMessage } from '@/src/utils'
import ConfirmModal from '@/src/components/common/ConfirmModal'
import { APPLICATION_STATUS_CONFIG } from '@/src/constants/application-status'

// Re-export STATUS_CONFIG alias for backwards-compatibility với các file đang import
export { APPLICATION_STATUS_CONFIG as STATUS_CONFIG } from '@/src/constants/application-status'

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
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  const cfg = APPLICATION_STATUS_CONFIG[status]
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
  const scoreMutation = useScoreApplication()
  const [isScoring, setIsScoring] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const initials = app.cvTitle?.slice(0, 2).toUpperCase() || 'UV'
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
  const colorIdx = app.id.charCodeAt(0) % colors.length
  const avatarBg = colors[colorIdx]

  return (
    <tr
      onClick={() => onViewDetail(app)}
      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
    >
      {/* Candidate / CV */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl ${avatarBg} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate max-w-44 group-hover:text-emerald-600 transition-colors">
              {app.candidateName || app.cvTitle}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium truncate max-w-44">
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <StatusBadge status={app.status} />
          {app.overallScore !== undefined && app.overallScore !== null ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-black shadow-xs">
              <Brain className="w-3.5 h-3.5 text-violet-500" />
              AI: {app.overallScore}% ({app.grade})
            </span>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (scoreMutation.isPending || isScoring) return
                  setShowConfirm(true)
                }}
                disabled={scoreMutation.isPending && isScoring}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black transition-all ${
                  scoreMutation.isPending && isScoring ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                title="Chấm điểm hồ sơ này bằng AI (1 AI Credit)"
              >
                {scoreMutation.isPending && isScoring ? (
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                ) : (
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                )}
                AI Chấm điểm
              </button>

              <ConfirmModal
                isOpen={showConfirm}
                title="Xác nhận chấm điểm AI"
                description="Đánh giá mức độ phù hợp của CV với vị trí tuyển dụng này sẽ tiêu tốn 1 AI Credit của công ty bạn. Bạn có muốn tiếp tục?"
                confirmText="Chấm điểm"
                cancelText="Hủy bỏ"
                variant="info"
                isLoading={scoreMutation.isPending && isScoring}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => {
                  setIsScoring(true)
                  scoreMutation.mutate(app.id, {
                    onSuccess: () => {
                      toast.success('Chấm điểm hồ sơ bằng AI thành công!')
                      setIsScoring(false)
                      setShowConfirm(false)
                    },
                    onError: (err) => {
                      toast.error(getErrorMessage(err))
                      setIsScoring(false)
                      setShowConfirm(false)
                    },
                  })
                }}
              />
            </>
          )}
        </div>
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
