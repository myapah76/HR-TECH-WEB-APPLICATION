import React from 'react'
import { Loader2, Sparkles } from 'lucide-react'

interface MockInterviewEvaluatingProps {
  evalStep: number
  evaluationSteps: string[]
}

export function MockInterviewEvaluating({
  evalStep,
  evaluationSteps,
}: MockInterviewEvaluatingProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <div className="relative inline-block">
          <Loader2 className="w-24 h-24 text-blue-500 animate-spin mx-auto" />
          <Sparkles className="w-8 h-8 text-amber-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight">AI Đang Chấm Điểm Toàn Diện</h2>
          <p className="text-slate-400 text-sm font-medium">
            Quá trình phân tích tệp âm thanh có thể mất 15-30 giây để hoàn thành
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl text-left space-y-4 shadow-xl">
          {evaluationSteps.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                evalStep === idx
                  ? 'text-blue-400 font-bold opacity-100'
                  : evalStep > idx
                    ? 'text-emerald-400 font-bold opacity-80'
                    : 'text-slate-500 opacity-40'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-[10px] ${
                  evalStep === idx
                    ? 'border-blue-400 animate-pulse bg-blue-500/10'
                    : evalStep > idx
                      ? 'border-emerald-400 bg-emerald-500/15'
                      : 'border-slate-600'
                }`}
              >
                {evalStep > idx ? '✓' : idx + 1}
              </div>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
