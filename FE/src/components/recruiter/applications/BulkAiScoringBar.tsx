'use client'

import React from 'react'
import { Sparkles, Sliders, Zap, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Button } from '@/src/components/ui/button'

interface BulkAiScoringBarProps {
  unscoredCount: number
  totalCount: number
  aiCreditBalance?: number
  isScoring: boolean
  thresholdPercent: number
  onThresholdChange: (value: number) => void
  onRunBulkScore: (options: {
    thresholdPercent: number
    autoRejectBelowThreshold: boolean
  }) => void
}

export default function BulkAiScoringBar({
  unscoredCount,
  totalCount,
  aiCreditBalance,
  isScoring,
  thresholdPercent,
  onThresholdChange,
  onRunBulkScore,
}: BulkAiScoringBarProps) {
  const [autoReject, setAutoReject] = React.useState<boolean>(false)

  const hasEnoughCredit =
    aiCreditBalance === undefined || aiCreditBalance >= unscoredCount
  const canRun = !isScoring && unscoredCount > 0 && hasEnoughCredit

  const handleTrigger = () => {
    if (!canRun) return
    onRunBulkScore({ thresholdPercent, autoRejectBelowThreshold: autoReject })
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-sm ${
        isScoring
          ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-white border-emerald-500/50 shadow-emerald-500/10 ring-2 ring-emerald-500/30'
          : 'bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border-emerald-200/80 dark:border-emerald-800/60'
      }`}
    >
      {/* Animated Glowing Scan Line when Scoring */}
      {isScoring && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent animate-shimmer pointer-events-none" />
      )}

      <div className="p-5 md:p-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          
          {/* Section 1: Title & Stats Info (4 Cols) */}
          <div className="lg:col-span-4 space-y-2">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform ${
                  isScoring
                    ? 'bg-emerald-400 text-slate-950 animate-bounce'
                    : 'bg-emerald-600 text-white dark:bg-emerald-500'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className={`text-base font-black tracking-tight ${
                    isScoring
                      ? 'text-white'
                      : 'text-emerald-950 dark:text-emerald-100'
                  }`}
                >
                  AI Bulk Match Screening
                </h3>
                <p
                  className={`text-xs ${
                    isScoring
                      ? 'text-emerald-200'
                      : 'text-slate-500 dark:text-emerald-400'
                  }`}
                >
                  Sàng lọc & chấm điểm tương thích CV tự động
                </p>
              </div>
            </div>

            {/* Quick Badge Stats */}
            <div className="flex items-center gap-2 pt-1">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                  isScoring
                    ? 'bg-emerald-900/60 text-emerald-200 border-emerald-700/50'
                    : 'bg-emerald-100/70 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Tổng CV: {totalCount}
              </span>

              {unscoredCount > 0 ? (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                    isScoring
                      ? 'bg-amber-950/60 text-amber-200 border-amber-700/50'
                      : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                  }`}
                >
                  Chưa chấm: {unscoredCount}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Đã hoàn tất
                </span>
              )}
            </div>
          </div>

          {/* Section 2: Controls (5 Cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Threshold Slider & Input */}
            <div
              className={`rounded-xl p-3 border transition-colors ${
                isScoring
                  ? 'bg-emerald-900/50 border-emerald-700/50 text-white'
                  : 'bg-white/90 dark:bg-slate-850/80 border-emerald-100 dark:border-emerald-900/70 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Điểm sàn lọc
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={thresholdPercent}
                    onChange={(e) =>
                      onThresholdChange(
                        Math.min(100, Math.max(0, Number(e.target.value) || 0))
                      )
                    }
                    className="w-14 px-1.5 py-0.5 text-xs font-black text-center text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-md outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-black text-emerald-600">%</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={thresholdPercent}
                onChange={(e) => onThresholdChange(Number(e.target.value))}
                className="w-full h-1.5 bg-emerald-200 dark:bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Toggle Auto Reject */}
            <div
              className={`rounded-xl p-3 border transition-all ${
                autoReject
                  ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80'
                  : isScoring
                  ? 'bg-emerald-900/50 border-emerald-700/50'
                  : 'bg-white/90 dark:bg-slate-850/80 border-emerald-100 dark:border-emerald-900/70 shadow-xs'
              }`}
            >
              <label className="flex items-center justify-between gap-2 cursor-pointer h-full">
                <div className="flex items-start gap-1.5">
                  <ShieldAlert
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      autoReject ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold block leading-tight text-slate-800 dark:text-slate-200">
                      Tự từ chối
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {autoReject ? `Huỷ đơn < ${thresholdPercent}%` : 'Giữ đơn, lọc sau'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoReject}
                  onClick={() => setAutoReject((v) => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
                    autoReject ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                      autoReject ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          {/* Section 3: Action Button & Credit Info (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col justify-center gap-2">
            <Button
              type="button"
              onClick={handleTrigger}
              disabled={!canRun}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isScoring
                  ? 'bg-emerald-500 text-slate-950 font-black animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600'
              }`}
            >
              {isScoring ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                  <span>AI Đang Phân Tích...</span>
                </>
              ) : unscoredCount === 0 ? (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Chấm lại tất cả ({totalCount} CV)</span>
                </>
              ) : !hasEnoughCredit ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-300" />
                  <span>Thiếu AI Credit</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Chạy AI Phân Tích ({unscoredCount} CV)</span>
                </>
              )}
            </Button>

            {aiCreditBalance !== undefined && (
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-emerald-400">
                <Info className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Credit cần: <strong className="text-slate-800 dark:text-slate-200">{unscoredCount > 0 ? unscoredCount : totalCount}</strong> | Dư:{' '}
                  <strong
                    className={
                      hasEnoughCredit
                        ? 'text-emerald-600 dark:text-emerald-300'
                        : 'text-rose-600'
                    }
                  >
                    {aiCreditBalance}
                  </strong>
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
