import React from 'react'
import { Mic, Square } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { motion } from 'motion/react'

interface MockInterviewRecordingStateProps {
  onStopRecording: () => void
}

export function MockInterviewRecordingState({
  onStopRecording,
}: MockInterviewRecordingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 bg-red-50/20 rounded-2xl border border-red-100 shadow-inner space-y-5 animate-pulse">
      <div className="relative">
        <motion.div
          className="absolute -inset-3 rounded-full bg-red-500/20"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
        <div className="p-4 bg-red-500 text-white rounded-full relative z-10">
          <Mic className="w-8 h-8 animate-bounce" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <span className="text-sm font-bold text-red-500 block uppercase tracking-widest">
          ĐANG GHI ÂM...
        </span>
        <p className="text-xs text-slate-400 font-medium">
          AI đang thu nhận giọng nói của bạn trực tiếp
        </p>
      </div>

      <Button
        type="button"
        onClick={onStopRecording}
        className="bg-red-500 hover:bg-red-600 text-white font-black h-12 px-8 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer"
      >
        <Square className="w-4 h-4 fill-white" />
        HOÀN THÀNH NÓI
      </Button>
    </div>
  )
}
