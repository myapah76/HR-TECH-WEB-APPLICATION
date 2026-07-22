'use client'

import React from 'react'
import { Star, X, CheckCircle2, History, XCircle, Award } from 'lucide-react'
import { InterviewRoundDetail } from '@/src/types/recruiter-interview'

interface ViewEvaluationResultModalProps {
  candidate: InterviewRoundDetail | null
  activeRound: number
  onClose: () => void
}

export default function ViewEvaluationResultModal({
  candidate,
  activeRound,
  onClose,
}: ViewEvaluationResultModalProps) {
  if (!candidate) return null

  const history = candidate.previousRoundsHistory || []
  const isPassed = candidate.status === 'PASSED' || candidate.status === 'INTERVIEW_COMPLETED'
  const isFailed = candidate.status === 'FAILED' || candidate.status === 'TERMINATED'
  const isCurrentRoundEvaluated = isPassed || isFailed || candidate.rating != null || Boolean(candidate.feedbackNote)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              {isCurrentRoundEvaluated
                ? `Kết Quả Đánh Giá Vòng ${activeRound} - ${candidate.candidateName}`
                : `Lịch Sử Đánh Giá Các Vòng Trước - ${candidate.candidateName}`}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{candidate.jobTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Round Result Banner & Feedback Note (ONLY IF EVALUATED) */}
        {isCurrentRoundEvaluated && (
          <>
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                isPassed
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : isFailed
                  ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-slate-50 border-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isPassed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : isFailed ? (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                ) : (
                  <History className="w-6 h-6 text-slate-500 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-black uppercase tracking-wide">Trạng thái kết quả Vòng {activeRound}:</p>
                  <p className="text-sm font-extrabold mt-0.5">
                    {isPassed ? 'ĐÃ ĐẠT (PASSED)' : isFailed ? 'KHÔNG ĐẠT (FAILED)' : candidate.status}
                  </p>
                </div>
              </div>

              {candidate.rating && (
                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="text-sm font-black text-amber-900 dark:text-amber-200">
                    {candidate.rating} / 5
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Nhận xét &amp; Feedback của HR / Người phỏng vấn:
              </label>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap min-h-24">
                {candidate.feedbackNote ? (
                  candidate.feedbackNote
                ) : (
                  <span className="italic text-slate-400">Không có ghi chú thêm</span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Previous Rounds Evaluation History (if any) */}
        {history.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-600" />
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

        {/* Close Button */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
