'use client'

import Link from 'next/link'
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react'
import { formatDateTime, getRelativeUrgency } from '@/src/utils'
import { useGetUpcomingInterviews } from '@/src/hooks/candidate/useGetUpcomingInterviews'

export default function UpcomingInterviews() {
  const { data: interviews = [], isLoading } = useGetUpcomingInterviews()

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs flex flex-col justify-between h-full min-h-90">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-650" />
            Lịch phỏng vấn
          </h3>
          <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
            {interviews.length} Lịch
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/20 animate-pulse space-y-3"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-200/80 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                  <div className="h-4 bg-slate-200/80 rounded w-12" />
                </div>
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-200/80 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : interviews.length > 0 ? (
          <div className="space-y-3">
            {interviews.slice(0, 2).map((interview, index) => {
              const urgency = getRelativeUrgency(interview.dateTime)
              return (
                <div
                  key={index}
                  className={`p-3.5 rounded-2xl border transition-all hover:scale-101 text-left flex flex-col gap-2.5 ${urgency.borderClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {interview.company}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">
                        {interview.position}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {interview.meetUrl ? (
                        <a
                          href={interview.meetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[8px] font-black uppercase px-2 py-0.75 rounded-md border bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer hover:underline"
                        >
                          Online
                        </a>
                      ) : (
                        <span className="text-[8px] font-black uppercase px-2 py-0.75 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-100">
                          Offline
                        </span>
                      )}
                      <span
                        className={`text-[8px] font-black uppercase px-2 py-0.75 rounded-md border shrink-0 ${urgency.badgeClass}`}
                      >
                        {urgency.label}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100/80 space-y-2">
                    <p className="text-[10px] font-black text-indigo-600 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatDateTime(interview.dateTime)}</span>
                    </p>

                    {interview.location && (
                      <div className="text-[9px] font-semibold text-slate-500 flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{interview.location}</span>
                      </div>
                    )}

                    {interview.applicationId && (
                      <Link
                        href={`/candidate/applied-jobs?appId=${interview.applicationId}`}
                        className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1 transition-colors cursor-pointer hover:underline uppercase"
                      >
                        <span>Chi tiết ứng tuyển</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-xs font-bold text-slate-400">
            Chưa có lịch phỏng vấn nào sắp tới.
          </div>
        )}
      </div>

      {interviews.length > 0 && (
        <Link
          href="/candidate/applied-jobs"
          className="mt-4 w-full text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs uppercase tracking-wider py-3 px-5 rounded-xl transition-colors block cursor-pointer active:scale-98"
        >
          Xem tất cả lịch
        </Link>
      )}
    </div>
  )
}
