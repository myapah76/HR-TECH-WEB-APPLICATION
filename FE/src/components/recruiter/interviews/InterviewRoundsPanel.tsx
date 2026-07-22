'use client'

import React from 'react'
import { Sparkles, Award } from 'lucide-react'
import { InterviewRoundConfig } from '@/src/types/recruiter-interview'

interface InterviewRoundsPanelProps {
  isLoading: boolean
  isConfigured: boolean
  roundsConfig: InterviewRoundConfig[]
  activeRound: number
  onRoundClick: (roundNumber: number) => void
  onOpenConfig: () => void
}

export default function InterviewRoundsPanel({
  isLoading,
  isConfigured,
  roundsConfig,
  activeRound,
  onRoundClick,
  onOpenConfig,
}: InterviewRoundsPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all">
      {isLoading && roundsConfig.length === 0 ? (
        <div className="py-6 text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span>Đang tải danh sách các vòng phỏng vấn...</span>
        </div>
      ) : !isConfigured ? (
        /* Unconfigured Guidance Box */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/40">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Chưa Cấu Hình Quy Trình Phỏng Vấn
              </h4>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                Tin tuyển dụng này chưa thiết lập số lượng vòng phỏng vấn. Vui lòng bấm nút cấu hình để thiết lập các vòng trước khi thực hiện lên lịch & nâng vòng cho ứng viên.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenConfig}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Cấu hình quy trình phỏng vấn ngay</span>
          </button>
        </div>
      ) : (
        /* Active Rounds Stepper */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Quy trình các vòng phỏng vấn ({roundsConfig.length} vòng + Duyệt Cuối)
            </span>
            <button
              type="button"
              onClick={onOpenConfig}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all cursor-pointer border border-emerald-200 dark:border-emerald-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chỉnh sửa Quy trình</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full pt-1">
            {roundsConfig.map((round) => {
              const isActive = round.roundNumber === activeRound
              return (
                <button
                  key={round.roundNumber}
                  type="button"
                  onClick={() => onRoundClick(round.roundNumber)}
                  className={`flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all cursor-pointer border min-w-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isActive
                        ? 'bg-white text-emerald-600'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {round.roundNumber}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="font-bold text-xs leading-tight truncate">{round.roundName}</p>
                    <p className="text-[10px] opacity-80 font-medium truncate mt-0.5">
                      {round.description || 'Tiêu chí phỏng vấn'}
                    </p>
                  </div>
                </button>
              )
            })}

            {/* Final Approval Step Tab */}
            {(() => {
              const approvalRoundNumber = roundsConfig.length + 1
              const isApprovalActive = activeRound === approvalRoundNumber
              return (
                <button
                  type="button"
                  onClick={() => onRoundClick(approvalRoundNumber)}
                  className={`flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all cursor-pointer border min-w-0 ${
                    isApprovalActive
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                      : 'bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100/80'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isApprovalActive
                        ? 'bg-white text-amber-600'
                        : 'bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="font-bold text-xs leading-tight truncate">Duyệt Tuyển Dụng</p>
                    <p className="text-[10px] opacity-80 font-medium truncate mt-0.5">
                      Duyệt trúng tuyển / Từ chối
                    </p>
                  </div>
                </button>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
