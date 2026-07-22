'use client'

import React from 'react'
import { CalendarClock, Clock, AlertCircle, CheckCircle2, UserRoundX } from 'lucide-react'

export interface InterviewSchedulesStatsProps {
  stats: {
    total: number
    waitingCandidate: number
    rescheduleRequests: number
    upcoming: number
    needUpdate: number
  }
}

export default function InterviewSchedulesStats({ stats }: InterviewSchedulesStatsProps) {
  const statItems = [
    {
      icon: CalendarClock,
      label: 'Tổng lịch',
      value: stats.total,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
    },
    {
      icon: Clock,
      label: 'Chờ candidate',
      value: stats.waitingCandidate,
      color: 'text-orange-700',
      bg: 'bg-orange-50',
    },
    {
      icon: AlertCircle,
      label: 'Yêu cầu đổi lịch',
      value: stats.rescheduleRequests,
      color: 'text-cyan-700',
      bg: 'bg-cyan-50',
    },
    {
      icon: CheckCircle2,
      label: 'Sắp phỏng vấn',
      value: stats.upcoming,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
    },
    {
      icon: UserRoundX,
      label: 'Cần cập nhật',
      value: stats.needUpdate,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs flex items-center gap-3"
        >
          <div
            className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
