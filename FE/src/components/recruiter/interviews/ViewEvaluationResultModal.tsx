'use client'

import React, { useMemo } from 'react'
import { Star, X, CheckCircle2, Award, MessageSquareText } from 'lucide-react'
import { InterviewRoundDetail } from '@/src/types/recruiter-interview'

interface ViewEvaluationResultModalProps {
  candidate: InterviewRoundDetail | null
  activeRound: number
  isApprovalStep?: boolean
  onClose: () => void
  onOpenFinalConfirmationModal?: (cand: InterviewRoundDetail) => void
}

export default function ViewEvaluationResultModal({
  candidate,
  activeRound,
  isApprovalStep = false,
  onClose,
  onOpenFinalConfirmationModal,
}: ViewEvaluationResultModalProps) {
  const allRounds = useMemo(() => {
    if (!candidate) return []
    const list = [...(candidate.previousRoundsHistory || [])]

    // Thêm vòng hiện tại nếu chưa có trong history
    const currentInHistory = list.some((h) => h.roundNumber === candidate.roundNumber)
    if (!currentInHistory && (candidate.rating != null || candidate.feedbackNote || candidate.status)) {
      list.push({
        roundNumber: candidate.roundNumber,
        roundName: candidate.roundName || `Vòng ${candidate.roundNumber}`,
        rating: candidate.rating || 0,
        feedbackNote: candidate.feedbackNote || '',
        evaluatedAt: candidate.attendedAt,
      })
    }

    return list.sort((a, b) => a.roundNumber - b.roundNumber)
  }, [candidate])

  if (!candidate) return null

  const isFinalized =
    candidate.status === ('ACCEPTED' as any) ||
    candidate.status === ('REJECTED' as any) ||
    candidate.status === 'FAILED' ||
    candidate.applicationStatus === 'ACCEPTED' ||
    candidate.applicationStatus === 'REJECTED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-xl w-full space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                Chi Tiết Đánh Giá Các Vòng Phỏng Vấn
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Ứng viên: <strong className="text-slate-800 dark:text-slate-200">{candidate.candidateName}</strong> ({candidate.jobTitle})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Evaluated Rounds */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-1">
          {allRounds.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 font-medium">
              Chưa có kết quả đánh giá vòng phỏng vấn nào cho ứng viên này.
            </div>
          ) : (
            allRounds.map((roundItem, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-2xs"
              >
                {/* Round Header & Rating */}
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {roundItem.roundNumber}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
                      {roundItem.roundName || `Vòng ${roundItem.roundNumber}`}
                    </h4>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-1.5 bg-amber-100/90 dark:bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-300/80 dark:border-amber-800 text-xs font-black text-amber-900 dark:text-amber-200">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>{roundItem.rating || 0} / 5</span>
                  </div>
                </div>

                {/* Feedback Note */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <MessageSquareText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nhận xét &amp; Đánh giá chuyên môn:</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {roundItem.feedbackNote ? (
                      roundItem.feedbackNote
                    ) : (
                      <span className="italic text-slate-400">Không có ghi chú thêm</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            {isApprovalStep && !isFinalized && onOpenFinalConfirmationModal && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenFinalConfirmationModal(candidate)
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Quyết Định Duyệt Tuyển Dụng
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer ml-auto"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
