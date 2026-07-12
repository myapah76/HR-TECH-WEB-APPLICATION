'use client'

import React, { useEffect, useState } from 'react'
import { Progress } from '@/src/components/ui/progress'
import {
  Loader2,
  Search,
  UserCheck,
  Cpu,
  Database,
  Network,
  Sparkles,
} from 'lucide-react'

interface CandidateFinderProgressCardProps {
  isFinding: boolean
  onComplete: () => void
}

export function CandidateFinderProgressCard({ isFinding, onComplete }: CandidateFinderProgressCardProps) {
  const [progress, setProgress] = useState(5)
  const [stepIndex, setStepIndex] = useState(0)

  const steps = [
    { text: 'Đang kết nối hệ thống AI Matcher...', progress: 15, icon: Cpu, color: 'text-indigo-500' },
    { text: 'Đang tải danh sách hồ sơ ứng viên (CVs)...', progress: 35, icon: Database, color: 'text-blue-500' },
    { text: 'Đang phân tích đồ thị kỹ năng qua Neo4j...', progress: 60, icon: Network, color: 'text-emerald-500' },
    { text: 'Đang tính toán điểm tương đồng & xếp hạng...', progress: 85, icon: Sparkles, color: 'text-purple-500' },
    { text: 'Đang tối ưu kết quả phù hợp nhất...', progress: 98, icon: UserCheck, color: 'text-teal-500' },
  ]

  // Progress animation logic
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isFinding) {
      // Step increment up to 95% while loading from API
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 95
          const diff = 95 - prev
          const step = Math.ceil(diff / 8)
          return prev + (step > 1 ? step : 1)
        })
      }, 300)
    } else {
      // Rapidly run to 100% once API is ready
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 50)
    }

    return () => clearInterval(interval)
  }, [isFinding])

  // Trigger onComplete when progress reaches 100%
  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        onComplete()
      }, 400)
      return () => clearTimeout(timeout)
    }
  }, [progress, onComplete])

  // Determine current active step based on progress value
  useEffect(() => {
    const currentStep = steps.findIndex((s) => progress < s.progress)
    if (currentStep !== -1) {
      setStepIndex(currentStep)
    } else {
      setStepIndex(steps.length - 1)
    }
  }, [progress])

  // Don't check !isFinding here to return null; let the parent control display via isVisualFinding
  // So we always render until the progress reaches 100% and triggers onComplete.

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Visual Scanning Animation */}
      <div className="relative flex justify-center items-center py-6">
        {/* Pulsing Outer Rings */}
        <div className="absolute w-48 h-48 rounded-full border border-emerald-500/20 animate-ping duration-3000" />
        <div className="absolute w-36 h-36 rounded-full border border-teal-500/30 animate-pulse duration-2000" />
        <div className="absolute w-24 h-24 rounded-full border border-teal-600/40" />

        {/* Orbiting Scanning Dot */}
        <div className="absolute w-36 h-36 rounded-full border border-dashed border-emerald-500/40 animate-spin" style={{ animationDuration: '15s' }}>
          <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_4px_rgba(16,185,129,0.6)]" />
        </div>

        {/* Central Core */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10 animate-bounce" style={{ animationDuration: '2s' }}>
          <Search className="w-8 h-8 text-white animate-pulse" />
        </div>

        {/* Candidate floating avatar placeholders around the radar */}
        <div className="absolute -top-2 left-1/4 w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-100 animate-pulse" style={{ animationDelay: '100ms' }}>
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">CV</div>
        </div>
        <div className="absolute top-1/3 -left-4 w-9 h-9 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-100 animate-pulse" style={{ animationDelay: '300ms' }}>
          <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-600">CV</div>
        </div>
        <div className="absolute bottom-4 right-2 w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-100 animate-pulse" style={{ animationDelay: '700ms' }}>
          <div className="w-full h-full bg-gradient-to-br from-teal-50 to-teal-200 flex items-center justify-center text-[10px] font-bold text-teal-600">CV</div>
        </div>
        <div className="absolute top-8 -right-2 w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-100 animate-pulse" style={{ animationDelay: '500ms' }}>
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-600">CV</div>
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-4 text-center">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            <span className="text-sm font-bold text-slate-700 transition-all duration-300">
              {steps[stepIndex].text}
            </span>
          </div>
          <span className="text-base font-bold text-emerald-600 tabular-nums">
            {progress}%
          </span>
        </div>

        <Progress
          value={progress}
          className="h-2.5 bg-slate-100 rounded-full overflow-hidden"
          indicatorColor="bg-gradient-to-r from-emerald-500 to-teal-600"
        />
      </div>

      {/* Step Log details with micro-animations */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Trạng thái tiến trình
        </span>
        <div className="space-y-2">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isCompleted = progress >= step.progress || (idx < stepIndex)
            const isActive = idx === stepIndex

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                  isActive
                    ? 'text-slate-800 font-bold scale-[1.01] translate-x-1'
                    : isCompleted
                    ? 'text-slate-500'
                    : 'text-slate-300'
                }`}
              >
                <div
                  className={`p-1 rounded-md transition-colors duration-300 ${
                    isActive
                      ? 'bg-emerald-50'
                      : isCompleted
                      ? 'bg-slate-100'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? step.color : 'text-current'}`} />
                </div>
                <span className="flex-1 text-left">{step.text}</span>
                {isCompleted && !isActive ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                    Xong
                  </span>
                ) : isActive ? (
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
