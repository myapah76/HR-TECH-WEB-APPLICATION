'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'
import { ApplicationDetailResponse } from '@/src/types'

export interface InterviewSchedulesAttentionBannerProps {
  attentionItems: ApplicationDetailResponse[]
  getWarning: (app: ApplicationDetailResponse) => { label: string; className: string }
}

export default function InterviewSchedulesAttentionBanner({
  attentionItems,
  getWarning,
}: InterviewSchedulesAttentionBannerProps) {
  if (attentionItems.length === 0) return null

  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-black text-amber-800">
          <AlertCircle className="h-4 w-4" />
          Cần xử lý
        </h2>
        <span className="text-xs font-black text-amber-700">{attentionItems.length} mục</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {attentionItems.slice(0, 6).map((app) => {
          const warning = getWarning(app)
          return (
            <span
              key={app.id}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${warning.className}`}
            >
              {warning.label} · {app.candidateName || app.cvTitle}
            </span>
          )
        })}
      </div>
    </div>
  )
}
