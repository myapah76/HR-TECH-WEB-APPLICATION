'use client'

import React, { useState } from 'react'
import { Star, X, History } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { InterviewRoundDetail } from '@/src/types/recruiter-interview'

interface InterviewEvaluationModalProps {
  candidate: InterviewRoundDetail | null
  activeRound: number
  isFinalRound?: boolean
  onClose: () => void
  onPass: (feedbackNote: string, rating: number) => void
  onFail: (feedbackNote: string, rating: number) => void
}

export default function InterviewEvaluationModal({
  candidate,
  activeRound,
  isFinalRound = false,
  onClose,
  onPass,
  onFail,
}: InterviewEvaluationModalProps) {
  const [rating, setRating] = useState(candidate?.rating || 5)
  const [feedbackNote, setFeedbackNote] = useState(candidate?.feedbackNote || '')

  if (!candidate) return null

  const history = candidate.previousRoundsHistory || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              Đánh giá Vòng {activeRound} - {candidate.candidateName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{candidate.jobTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Rounds History Panel (Lịch sử đánh giá các vòng trước) */}
        {history.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-600" />
              Lịch sử đánh giá các vòng trước ({history.length} vòng):
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>{h.roundName}</span>
                    <span className="flex items-center text-amber-500 text-[11px]">
                      {h.rating} <Star className="w-3 h-3 fill-amber-400 ml-0.5" />
                    </span>
                  </div>
                  {h.feedbackNote && (
                    <p className="text-[11px] text-slate-500 italic leading-relaxed">
                      &quot;{h.feedbackNote}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score and Notes Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Đánh giá điểm số Vòng {activeRound} (1 - 5 sao):
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Nhận xét & Feedback chuyên môn Vòng {activeRound}:
            </label>
            <textarea
              rows={4}
              required
              placeholder="Nhập nhận xét kỹ năng, câu trả lời, lý do Đạt hoặc Loại..."
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            onClick={() => onFail(feedbackNote, rating)}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Không Đạt (Loại)
          </Button>
          <Button
            type="button"
            onClick={() => onPass(feedbackNote, rating)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            {isFinalRound ? 'Đạt - Complete Tất Cả Vòng' : 'Đạt - Nâng Vòng Kế Tiếp'}
          </Button>
        </div>
      </div>
    </div>
  )
}
