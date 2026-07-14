'use client'

import { Heart, Send, Clock } from 'lucide-react'
import { useGetRecentActivities } from '@/src/hooks/candidate/useGetRecentActivities'
import { getRelativeTime } from '@/src/utils'

export default function RecentActivity() {
  const { data: activities = [], isLoading } = useGetRecentActivities(5)

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs flex flex-col justify-between h-full min-h-90">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-slate-900">Hoạt động gần đây</h2>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 p-3 animate-pulse">
                <div className="h-10 w-10 bg-slate-100 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200/80 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/4" />
                </div>
              </div>
            ))
          ) : activities.length > 0 ? (
            activities.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    item.status === 'submitted'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-rose-50 text-rose-605'
                  }`}
                >
                  {item.status === 'submitted' ? (
                    <Send className="h-4 w-4" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.action}</p>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                    {getRelativeTime(item.date)} trước
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs font-bold text-slate-400">
              Chưa có hoạt động gần đây
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
