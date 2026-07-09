import React, { useEffect, useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { X, Loader2 } from 'lucide-react'
import { AiMatchResultDisplay } from '@/src/components/candidate/recommendation/AiMatchResultDisplay'
import { usePremiumAiMatch } from '@/src/hooks/recommendation'
import { AiMatchHistoryResponse } from '@/src/types/recommendation'

import { ApplicationMatchModalProps } from '@/src/types/application'

export function ApplicationMatchModal({
  isOpen,
  onClose,
  cvId,
  jobId,
  jobTitle,
  companyName,
}: ApplicationMatchModalProps) {
  const [matchScore, setMatchScore] = useState<AiMatchHistoryResponse | null>(null)
  const calculateScoreMutation = usePremiumAiMatch()

  useEffect(() => {
    if (isOpen && cvId && jobId && !matchScore && !calculateScoreMutation.isPending) {
      calculateScoreMutation.mutate(
        { cvId, jobId },
        {
          onSuccess: (score) => setMatchScore(score),
          onError: (error) => console.error('Failed to calculate match score:', error),
        }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cvId, jobId])

  // Reset when closed during render
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (!isOpen) {
      setMatchScore(null)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-blue-900">
              Đánh giá mức độ phù hợp bằng AI
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Kết quả đối chiếu giữa CV của bạn và công việc <span className="font-semibold text-slate-800">{jobTitle}</span> tại <span className="font-semibold text-slate-800">{companyName}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-slate-200 rounded-full h-10 w-10 shrink-0 ml-4"
          >
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {calculateScoreMutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-slate-500 font-medium">AI đang phân tích và chấm điểm CV...</p>
            </div>
          ) : matchScore ? (
            <AiMatchResultDisplay matchScore={matchScore} />
          ) : calculateScoreMutation.isError ? (
            <div className="text-center text-rose-600 py-8 font-medium">
              Có lỗi xảy ra trong quá trình đánh giá. Vui lòng thử lại sau.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
