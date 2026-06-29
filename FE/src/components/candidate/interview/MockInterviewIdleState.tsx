import React from 'react'
import { Mic } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

interface MockInterviewIdleStateProps {
  onStartRecording: () => void
}

export function MockInterviewIdleState({ onStartRecording }: MockInterviewIdleStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-slate-50/30 rounded-2xl border border-slate-100 shadow-inner space-y-4">
      <div className="p-4 bg-blue-50 text-blue-600 rounded-full animate-pulse">
        <Mic className="w-8 h-8" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="font-black text-slate-800 text-base">Sẵn sàng trả lời?</h3>
        <p className="text-xs text-slate-400 font-semibold max-w-sm px-4">
          Hãy chuẩn bị câu trả lời của bạn, sau đó nhấn nút ghi âm và nói.
        </p>
      </div>
      <Button
        type="button"
        onClick={onStartRecording}
        className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-6 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer mt-2"
      >
        <Mic className="w-4 h-4" />
        BẮT ĐẦU NÓI
      </Button>
    </div>
  )
}
