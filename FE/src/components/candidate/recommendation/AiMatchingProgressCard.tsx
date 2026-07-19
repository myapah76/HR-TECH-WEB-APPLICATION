'use client'

import React from 'react'
import { Card } from '@/src/components/ui/card'
import { Brain } from 'lucide-react'

interface AiMatchingProgressCardProps {
  progress: number
  getProgressText: (pct: number) => string
}

export function AiMatchingProgressCard({ progress, getProgressText }: AiMatchingProgressCardProps) {
  return (
    <Card className="border-slate-200/80 shadow-md bg-white p-8 flex flex-col items-center justify-center min-h-[500px] overflow-hidden relative animate-in fade-in duration-300">
      {/* Radar Circular Scanning Animation */}
      <div className="relative w-44 h-44 flex items-center justify-center mb-8">
        {/* Outer pulsing ring */}
        <div className="absolute inset-0 w-full h-full rounded-full border border-blue-100 bg-blue-50/10 animate-pulse"></div>
        {/* Middle pulsing ring */}
        <div className="absolute inset-8 rounded-full border border-blue-200/50 bg-blue-50/20"></div>
        {/* Glowing Center radar */}
        <div className="absolute inset-14 rounded-full bg-gradient-to-tr from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-200 z-10">
          <Brain className="w-8 h-8 animate-pulse text-white" />
        </div>

        {/* Rotating scanner beam */}
        <div className="absolute inset-0 w-full h-full rounded-full border-2 border-transparent border-t-blue-500/80 animate-spin-slow"></div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2 relative">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-700 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-[11px] text-slate-400 font-bold mb-6">
        TIẾN TRÌNH: {progress.toFixed(0)}%
      </div>

      {/* Cycle through scanning steps */}
      <div className="text-center space-y-2">
        <h4 className="font-extrabold text-slate-800 text-lg">AI đang chấm điểm phù hợp...</h4>
        <div className="h-6 flex items-center justify-center">
          <p className="text-blue-600 font-semibold text-sm transition-all duration-300 animate-pulse">
            {getProgressText(progress)}
          </p>
        </div>
      </div>

      {/* Custom scanning animation styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .animate-spin-slow {
            animation: spin 3s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </Card>
  )
}
