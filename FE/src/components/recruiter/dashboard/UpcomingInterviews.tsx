import { Calendar, Clock } from 'lucide-react'

interface UpcomingInterviewsProps {
  interviews: any[]
  isLoading?: boolean
}

const formatInterviewTime = (dateTimeStr: string) => {
  try {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })
  } catch (e) {
    return dateTimeStr
  }
}

const getInterviewDayLabel = (dateTimeStr: string) => {
  try {
    const date = new Date(dateTimeStr)
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return { label: 'Hôm nay', classes: 'bg-rose-50 text-rose-700 border-rose-100/60' }
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return { label: 'Ngày mai', classes: 'bg-amber-50 text-amber-700 border-amber-100/60' }
    }
    return { label: 'Sắp tới', classes: 'bg-slate-50 text-slate-500 border-slate-200/60' }
  } catch (e) {
    return { label: 'Lịch hẹn', classes: 'bg-slate-50 text-slate-500 border-slate-200/60' }
  }
}

export default function UpcomingInterviews({ interviews, isLoading }: UpcomingInterviewsProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm text-left flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Lịch phỏng vấn sắp tới</h2>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Lịch phỏng vấn
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.length > 0 ? (
              interviews.map((app: any, i) => {
                const dayInfo = getInterviewDayLabel(app.interviewDateTime)
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Status Icon Wrapper */}
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {app.cvTitle.replace('.pdf', '')}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                            Phỏng vấn
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md truncate max-w-44 lg:max-w-56">
                            {app.jobTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                      {/* Urgency/Day Tag */}
                      <span
                        className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${dayInfo.classes}`}
                      >
                        {dayInfo.label}
                      </span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatInterviewTime(app.interviewDateTime)}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-10 text-sm font-semibold text-slate-400 dark:text-slate-500">
                Chưa có lịch hẹn phỏng vấn nào sắp tới
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
