'use client'

import { CheckCircle2, XCircle, UserRoundX } from 'lucide-react'
import { ApplicationDetailResponse, ApplicationStatus } from '@/src/types'

interface Props {
  app: ApplicationDetailResponse
  compact?: boolean
  isPending: boolean
  onAcceptReschedule: (id: string) => void
  onRejectReschedule: (id: string) => void
  onUpdateStatus: (id: string, status: ApplicationStatus, message: string) => void
}

export default function InterviewQuickActions({
  app,
  compact = false,
  isPending,
  onAcceptReschedule,
  onRejectReschedule,
  onUpdateStatus,
}: Props) {
  const buttonClass = compact
    ? 'inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-black transition disabled:opacity-60'
    : 'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition disabled:opacity-60'

  if (app.status === ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE) {
    return (
      <>
        <button
          type="button"
          disabled={isPending}
          onClick={() => onAcceptReschedule(app.id)}
          className={`${buttonClass} bg-emerald-500 text-white hover:bg-emerald-600`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Chấp nhận lịch mới
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => onRejectReschedule(app.id)}
          className={`${buttonClass} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}
        >
          <XCircle className="h-4 w-4" />
          Từ chối lịch mới
        </button>
      </>
    )
  }

  if (app.status === ApplicationStatus.INTERVIEW) {
    return (
      <>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            onUpdateStatus(
              app.id,
              ApplicationStatus.INTERVIEW_COMPLETED,
              'Đã đánh dấu hoàn thành phỏng vấn.'
            )
          }
          className={`${buttonClass} bg-teal-500 text-white hover:bg-teal-600`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Hoàn thành phỏng vấn
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            onUpdateStatus(
              app.id,
              ApplicationStatus.NO_SHOW,
              'Đã đánh dấu candidate không tham gia.'
            )
          }
          className={`${buttonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
        >
          <UserRoundX className="h-4 w-4" />
          Candidate không tham gia
        </button>
      </>
    )
  }

  if (app.status === ApplicationStatus.NO_SHOW) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          onUpdateStatus(app.id, ApplicationStatus.REJECTED, 'Đã từ chối candidate.')
        }
        className={`${buttonClass} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`}
      >
        <XCircle className="h-4 w-4" />
        Từ chối candidate
      </button>
    )
  }

  return <span className="text-xs font-bold text-slate-400">Không có thao tác nhanh</span>
}
