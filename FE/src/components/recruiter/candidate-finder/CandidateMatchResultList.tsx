'use client'

import React, { useMemo } from 'react'
import Image from 'next/image'
import { Users, CheckCircle2, User } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { CandidateRecommendationResponse } from '@/src/types/recommendation'
import { CandidateMatchGrade } from '@/src/enums/recommendation.enum'

interface CandidateMatchResultListProps {
  candidates: CandidateRecommendationResponse[]
  onSelectCandidate: (candidate: CandidateRecommendationResponse) => void
  onReset: () => void
}

const GRADE_STYLES: Record<CandidateMatchGrade, { badge: string; bar: string }> = {
  [CandidateMatchGrade.EXCELLENT]: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    bar: 'bg-emerald-500',
  },
  [CandidateMatchGrade.GOOD]: {
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
    bar: 'bg-violet-500',
  },
  [CandidateMatchGrade.FAIR]: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    bar: 'bg-amber-500',
  },
  [CandidateMatchGrade.POOR]: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    bar: 'bg-red-400',
  },
}

const GRADE_LABELS: Record<CandidateMatchGrade, string> = {
  [CandidateMatchGrade.EXCELLENT]: 'Xuất sắc',
  [CandidateMatchGrade.GOOD]: 'Tốt',
  [CandidateMatchGrade.FAIR]: 'Trung bình',
  [CandidateMatchGrade.POOR]: 'Yếu',
}

export function CandidateMatchResultList({
  candidates,
  onSelectCandidate,
  onReset,
}: CandidateMatchResultListProps) {
  const sortedCandidates = useMemo(
    () => [...candidates].sort((a, b) => b.matchScore - a.matchScore),
    [candidates]
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          Đã tìm thấy {sortedCandidates.length} ứng viên phù hợp
        </h2>
        <Button
          variant="outline"
          onClick={onReset}
          className="font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
        >
          Tìm kiếm lại
        </Button>
      </div>

      {/* Result grid */}
      {sortedCandidates.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <Users className="w-12 h-12 text-slate-350 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-lg">
            Không tìm thấy ứng viên phù hợp với yêu cầu kỹ năng của vị trí này.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedCandidates.map((candidate, idx) => {
            const gradeStyle =
              GRADE_STYLES[candidate.matchGrade] ?? GRADE_STYLES[CandidateMatchGrade.POOR]
            const scorePercent = Math.round(candidate.matchScore * 100)

            return (
              <Card
                key={candidate.userId ?? idx}
                className="border-slate-200/60 hover:border-emerald-300 hover:shadow-md transition-all bg-white overflow-hidden group rounded-2xl"
              >
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 group-hover:bg-emerald-50/20 transition-colors p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {candidate.avatarUrl ? (
                        <Image
                          src={candidate.avatarUrl}
                          alt={candidate.candidateName || 'Candidate Avatar'}
                          width={48}
                          height={48}
                          unoptimized
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-sm">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-base truncate">
                        {candidate.candidateName || 'Ẩn danh'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        Dựa trên CV:{' '}
                        <span className="font-semibold text-emerald-600">
                          {candidate.bestCvTitle}
                        </span>
                      </p>
                    </div>

                    {/* Score badge */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-black border ${gradeStyle.badge}`}
                      >
                        {scorePercent}%
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${gradeStyle.badge}`}>
                        {GRADE_LABELS[candidate.matchGrade] ?? candidate.matchGrade}
                      </span>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${gradeStyle.bar}`}
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Matched skills */}
                  {candidate.matchedSkills?.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Kỹ năng đáp ứng
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.matchedSkills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded border border-emerald-100"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.matchedSkills.length > 5 && (
                          <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs font-semibold rounded border border-slate-100">
                            +{candidate.matchedSkills.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* View detail button */}
                  <Button
                    id={`view-candidate-${candidate.userId}`}
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectCandidate(candidate)}
                    className="w-full font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-500 transition-all cursor-pointer rounded-xl"
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
