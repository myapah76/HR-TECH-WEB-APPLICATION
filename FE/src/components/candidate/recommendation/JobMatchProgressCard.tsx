import React from 'react'
import Image from 'next/image'
import { Progress } from '@/src/components/ui/progress'
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Map,
  Layers,
  FileSearch,
} from 'lucide-react'
import { JobMatchingTaskResponse } from '@/src/types/recommendation'
import { JobMatchingStatus } from '@/src/enums/recommendation.enum'

interface JobMatchProgressCardProps {
  isProcessActive: boolean
  taskStatus: JobMatchingTaskResponse | null
  onReset?: () => void
}

export function JobMatchProgressCard({ isProcessActive, taskStatus, onReset }: JobMatchProgressCardProps) {
  if (!isProcessActive) return null

  const getStatusIcon = (status: JobMatchingStatus | undefined) => {
    switch (status) {
      case JobMatchingStatus.PENDING:
        return <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      case JobMatchingStatus.EXTRACTING:
        return <FileSearch className="w-8 h-8 text-amber-500 animate-pulse" />
      case JobMatchingStatus.MAPPING:
        return <Map className="w-8 h-8 text-blue-500 animate-pulse" />
      case JobMatchingStatus.SCORING:
        return <Layers className="w-8 h-8 text-indigo-500 animate-pulse" />
      case JobMatchingStatus.DONE:
        return <CheckCircle2 className="w-8 h-8 text-emerald-500" />
      case JobMatchingStatus.FAILED:
        return <AlertCircle className="w-8 h-8 text-rose-500" />
      default:
        return <Loader2 className="w-8 h-8 text-slate-400" />
    }
  }

  const getStatusColor = (status: JobMatchingStatus | undefined) => {
    switch (status) {
      case JobMatchingStatus.PENDING:
        return 'bg-slate-500'
      case JobMatchingStatus.EXTRACTING:
        return 'bg-amber-500'
      case JobMatchingStatus.MAPPING:
        return 'bg-blue-500'
      case JobMatchingStatus.SCORING:
        return 'bg-indigo-500'
      case JobMatchingStatus.DONE:
        return 'bg-emerald-500'
      case JobMatchingStatus.FAILED:
        return 'bg-rose-500'
      default:
        return 'bg-blue-600'
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-slate-100/50 rounded-2xl border border-slate-200 shadow-inner min-h-125 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
      {/* The CV Mockup Image */}
      <div className="relative w-full max-w-sm aspect-[1/1.4] rounded-lg shadow-2xl overflow-hidden border border-slate-300 bg-white">
        <Image
          src="/cv_mockup.png"
          alt="CV Mockup"
          fill
          sizes="(max-width: 384px) 100vw, 384px"
          className="object-cover opacity-90"
        />

        {/* Scanner overlay */}
        {isProcessActive && (
          <>
            <div className="absolute left-0 w-full h-0.75 bg-blue-500 shadow-[0_0_25px_8px_rgba(59,130,246,0.8)] z-20 animate-scanner" />
            <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay animate-pulse z-10" />
          </>
        )}
      </div>

      {/* Polling Progress Overlay */}
      {isProcessActive && taskStatus && (
        <div className="absolute bottom-12 w-[85%] max-w-sm bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-blue-100 animate-in slide-in-from-bottom-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-full">
              {getStatusIcon(taskStatus.status)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-slate-800">
                  {taskStatus.message}
                </span>
                <span className="font-black text-blue-700">
                  {taskStatus.progressPercentage}%
                </span>
              </div>
              <Progress
                value={taskStatus.progressPercentage}
                className="h-2 bg-blue-100"
                indicatorColor={getStatusColor(taskStatus.status)}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 w-full opacity-80">
            <div
              className={`text-[10px] font-bold text-center p-1.5 rounded ${taskStatus.progressPercentage >= 20 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}
            >
              Bóc tách
            </div>
            <div
              className={`text-[10px] font-bold text-center p-1.5 rounded ${taskStatus.progressPercentage >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}
            >
              Ánh xạ
            </div>
            <div
              className={`text-[10px] font-bold text-center p-1.5 rounded ${taskStatus.progressPercentage >= 80 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}
            >
              Graph
            </div>
            <div
              className={`text-[10px] font-bold text-center p-1.5 rounded ${taskStatus.progressPercentage === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
            >
              Xong
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
