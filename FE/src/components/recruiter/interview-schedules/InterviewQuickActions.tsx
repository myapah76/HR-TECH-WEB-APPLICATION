'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ApplicationDetailResponse } from '@/src/types'

interface Props {
  app: ApplicationDetailResponse
  compact?: boolean
  onForwardToJobInterviews?: (jobId: string, appId: string) => void
}

export default function InterviewQuickActions({
  app,
  compact = false,
  onForwardToJobInterviews,
}: Props) {
  const router = useRouter()

  const handleForward = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onForwardToJobInterviews && app.jobId) {
      onForwardToJobInterviews(app.jobId, app.id)
    } else if (app.jobId) {
      router.push(`/recruiter/manage-jobs/${app.jobId}/interviews?appId=${app.id}`)
    }
  }

  return (
    <button
      type="button"
      onClick={handleForward}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer ${
        compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
      }`}
      title="Đi tới trang quản lý phỏng vấn chi tiết của Job này"
    >
      <span>Quản lý tại Job</span>
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  )
}
