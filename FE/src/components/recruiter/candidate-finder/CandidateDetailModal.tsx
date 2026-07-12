'use client'

import React, { useMemo, useEffect } from 'react'
import { X, User, ExternalLink, CheckCircle2, XCircle, FileText } from 'lucide-react'
import { CandidateRecommendationResponse } from '@/src/types/recommendation'
import { CandidateMatchGrade } from '@/src/enums/recommendation.enum'

interface CandidateDetailModalProps {
  candidate: CandidateRecommendationResponse | null
  onClose: () => void
}

const GRADE_CONFIG: Record<
  CandidateMatchGrade,
  { label: string; ring: string; text: string; badge: string }
> = {
  [CandidateMatchGrade.EXCELLENT]: {
    label: 'Xuất sắc',
    ring: 'stroke-emerald-500',
    text: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  [CandidateMatchGrade.GOOD]: {
    label: 'Tốt',
    ring: 'stroke-violet-500',
    text: 'text-violet-600',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  [CandidateMatchGrade.FAIR]: {
    label: 'Trung bình',
    ring: 'stroke-amber-500',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  [CandidateMatchGrade.POOR]: {
    label: 'Yếu',
    ring: 'stroke-red-400',
    text: 'text-red-600',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
}

export function CandidateDetailModal({ candidate, onClose }: CandidateDetailModalProps) {
  // Lock background scroll when modal is active
  useEffect(() => {
    if (candidate) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [candidate])

  const gradeConfig = useMemo(
    () =>
      candidate
        ? (GRADE_CONFIG[candidate.matchGrade] ?? GRADE_CONFIG[CandidateMatchGrade.POOR])
        : null,
    [candidate]
  )

  const scorePercent = useMemo(
    () => (candidate ? Math.round(candidate.matchScore * 100) : 0),
    [candidate]
  )

  // SVG progress ring values
  const RADIUS = 54
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const strokeDashoffset = useMemo(
    () => CIRCUMFERENCE - (scorePercent / 100) * CIRCUMFERENCE,
    [scorePercent]
  )

  if (!candidate || !gradeConfig) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      id="candidate-detail-modal-overlay"
    >
      <div className="relative w-full max-w-[92vw] h-[92vh] max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <h2 className="text-lg font-black text-slate-900">Chi tiết ứng viên</h2>
          <button
            id="close-candidate-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: 2 columns */}
        <div className="flex flex-1 overflow-hidden">
          {/* ===== LEFT PANEL: Candidate Profile ===== */}
          <div className="w-2/5 border-r border-slate-100 p-6 overflow-y-auto flex flex-col gap-6">
            {/* Avatar + name */}
            <div className="flex flex-col items-center text-center gap-3">
              {candidate.avatarUrl ? (
                <img
                  src={candidate.avatarUrl}
                  alt={candidate.candidateName}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {candidate.candidateName || 'Ẩn danh'}
                </h3>
                {candidate.email && (
                  <p className="text-sm text-slate-500 mt-0.5">{candidate.email}</p>
                )}
              </div>
            </div>

            {/* Score ring */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <svg width="128" height="128" className="-rotate-90">
                  {/* Track */}
                  <circle
                    cx="64"
                    cy="64"
                    r={RADIUS}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  {/* Progress */}
                  <circle
                    cx="64"
                    cy="64"
                    r={RADIUS}
                    fill="none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    className={`${gradeConfig.ring} transition-all duration-700`}
                  />
                </svg>
                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-black ${gradeConfig.text}`}>
                    {scorePercent}%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Phù hợp</span>
                </div>
              </div>
              {/* Grade badge */}
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-bold border ${gradeConfig.badge}`}
              >
                {gradeConfig.label}
              </span>
            </div>

            {/* Matched skills */}
            {candidate.matchedSkills?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-700">
                    Kỹ năng đáp ứng ({candidate.matchedSkills.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing skills */}
            {candidate.missingSkills?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-bold text-slate-700">
                    Kỹ năng còn thiếu ({candidate.missingSkills.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CV source note */}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                Đánh giá dựa trên CV:{' '}
                <span className="font-bold text-emerald-700">{candidate.bestCvTitle}</span>
              </p>
            </div>
          </div>

          {/* ===== RIGHT PANEL: CV Preview ===== */}
          <div className="w-3/5 flex flex-col">
            {/* CV panel header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700 truncate max-w-[260px]">
                  {candidate.bestCvTitle}
                </span>
              </div>
              {candidate.bestCvFileUrl && (
                <a
                  href={candidate.bestCvFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở CV mới
                </a>
              )}
            </div>

            {/* CV embed */}
            <div className="flex-1 bg-slate-100">
              {candidate.bestCvFileUrl ? (
                <iframe
                  src={candidate.bestCvFileUrl}
                  title={`CV của ${candidate.candidateName}`}
                  className="w-full h-full min-h-[500px] border-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-20">
                  <FileText className="w-16 h-16 text-slate-200" />
                  <p className="text-sm font-medium">CV không có sẵn để xem trước</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
