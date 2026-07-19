'use client'

import React from 'react'
import { X, Brain, Lightbulb, Loader2 } from 'lucide-react'
import { useGetApplicationDetail } from '@/src/hooks/application'

interface Props {
  applicationId: string
  isOpen: boolean
  onClose: () => void
}

function gradeColor(grade?: string) {
  if (!grade) return 'text-slate-550'
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
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 48 48)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="48" y="44" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f172a">
        {pct}
      </text>
      <text x="48" y="58" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94a3b8">
        / 100
      </text>
    </svg>
  )
}

export function ApplicationScoreDetailModal({ applicationId, isOpen, onClose }: Props) {
  const { data: app, isLoading } = useGetApplicationDetail(applicationId)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-500" />
            Chi tiết đánh giá AI
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-650" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-650" />
              <p className="text-sm font-semibold text-slate-500">Đang tải kết quả...</p>
            </div>
          ) : !app || app.overallScore === undefined || app.overallScore === null ? (
            <div className="text-center py-12 text-slate-500">
              <p className="font-semibold text-sm">Không tìm thấy thông tin đánh giá.</p>
              <p className="text-xs text-slate-400 mt-1">Đơn ứng tuyển chưa được chấm điểm hoặc xảy ra lỗi.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score card */}
              <div className="rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50/50 to-violet-50/50 p-5">
                <div className="flex items-center gap-6">
                  <ScoreRing score={app.overallScore} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black ${gradeColor(app.grade)}`}>
                        {app.grade || '—'}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">Xếp loại phù hợp</span>
                    </div>
                    {app.aiSummary && (
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">
                        {app.aiSummary}
                      </p>
                    )}
                  </div>
                </div>

                {app.aiSuggestion && (
                  <div className="mt-4 pt-4 border-t border-indigo-100/50">
                    <h4 className="flex items-center gap-1.5 text-xs font-black text-indigo-600 uppercase tracking-wider mb-2">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Gợi ý cải thiện từ AI
                    </h4>
                    <p className="text-sm text-slate-650 font-semibold leading-relaxed whitespace-pre-line">
                      {app.aiSuggestion}
                    </p>
                  </div>
                )}
              </div>

              {/* Notice */}
              <div className="text-slate-400 text-xs text-center border-t border-slate-100 pt-4 font-semibold">
                Đánh giá độc lập trên hồ sơ ứng tuyển tại {app.companyName || 'Nhà tuyển dụng'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
