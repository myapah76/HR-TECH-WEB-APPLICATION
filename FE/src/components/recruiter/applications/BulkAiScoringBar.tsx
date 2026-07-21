'use client'

import React, { useState } from 'react'
import { Sparkles, Sliders } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

interface BulkAiScoringBarProps {
  unscoredCount: number
  aiCreditBalance?: number
  isScoring: boolean
  onRunBulkScore: (options: {
    thresholdPercent: number
    autoRejectBelowThreshold: boolean
    sendRejectionEmail: boolean
  }) => void
}

export default function BulkAiScoringBar({
  unscoredCount,
  isScoring,
  onRunBulkScore,
}: BulkAiScoringBarProps) {
  const [thresholdPercent, setThresholdPercent] = useState<number>(60)

  const handleTrigger = () => {
    onRunBulkScore({
      thresholdPercent,
      autoRejectBelowThreshold: true,
      sendRejectionEmail: false,
    })
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-xs flex flex-col gap-3 max-w-xs">
      {/* 1. Input nhập số điểm sàn */}
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Điểm sàn duyệt (%):</span>
        </label>
        <input
          type="number"
          min={0}
          max={100}
          value={thresholdPercent}
          onChange={(e) => setThresholdPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
          className="w-20 px-3 py-1.5 text-xs font-black text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
        />
      </div>

      {/* 2. Button Lọc CV bên dưới */}
      <Button
        type="button"
        onClick={handleTrigger}
        disabled={isScoring || unscoredCount === 0}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>
          {isScoring
            ? 'Đang phân tích AI...'
            : unscoredCount === 0
            ? 'Đã chấm điểm tất cả'
            : 'Lọc CV'}
        </span>
      </Button>
    </div>
  )
}
