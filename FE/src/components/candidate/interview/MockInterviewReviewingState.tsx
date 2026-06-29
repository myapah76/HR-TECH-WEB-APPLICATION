import React from 'react'
import { RefreshCw, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

interface MockInterviewReviewingStateProps {
  onSubmit: (e: React.FormEvent) => void
  audioUrlLocal: string | null
  onRetry: () => void
  isSubmittingOrUploading: boolean
  isUploading: boolean
  audioBlob: Blob | null
  currentQuestionIndex: number
  totalQuestions: number
}

export function MockInterviewReviewingState({
  onSubmit,
  audioUrlLocal,
  onRetry,
  isSubmittingOrUploading,
  isUploading,
  audioBlob,
  currentQuestionIndex,
  totalQuestions,
}: MockInterviewReviewingStateProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-650 block uppercase tracking-wider">
            Nghe lại câu trả lời:
          </span>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Ghi âm sẵn sàng
          </span>
        </div>

        {audioUrlLocal && (
          <div className="flex items-center justify-center p-2 bg-white rounded-xl border shadow-xs">
            <audio src={audioUrlLocal} controls className="w-full" />
          </div>
        )}

        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
          * Bạn có thể nghe lại để kiểm tra âm lượng. Nếu thấy chưa ưng ý hoặc bị ồn, hãy
          bấm **THỬ LẠI** để ghi âm lại.
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-6 gap-4">
        <button
          type="button"
          onClick={onRetry}
          disabled={isSubmittingOrUploading}
          className="bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 h-12 px-6 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          THỬ LẠI
        </button>

        <Button
          type="submit"
          disabled={!audioBlob || isSubmittingOrUploading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-6 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isUploading
            ? 'ĐANG TẢI AUDIO...'
            : currentQuestionIndex === totalQuestions
              ? 'NỘP BÀI & XEM KẾT QUẢ'
              : 'CÂU TIẾP THEO'}
          {isSubmittingOrUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </Button>
      </div>
    </form>
  )
}
