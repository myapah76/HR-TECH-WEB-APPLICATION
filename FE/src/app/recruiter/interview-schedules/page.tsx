'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, Loader2 } from 'lucide-react'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import {
  useAcceptCandidateReschedule,
  useGetRecruiterInterviewSchedules,
  useRejectCandidateReschedule,
} from '@/src/hooks/application'
import { useGetMyCompany } from '@/src/hooks/company'
import { useAuthStore } from '@/src/stores/auth.store'
import { ApplicationDetailResponse, ApplicationStatus } from '@/src/types'
import { getDateKey, getDateLabel, getErrorMessage } from '@/src/utils'

import InterviewSchedulesStats from '@/src/components/recruiter/interview-schedules/InterviewSchedulesStats'
import InterviewSchedulesAttentionBanner from '@/src/components/recruiter/interview-schedules/InterviewSchedulesAttentionBanner'
import InterviewSchedulesFilterBar, {
  DateFilter,
  ViewMode,
} from '@/src/components/recruiter/interview-schedules/InterviewSchedulesFilterBar'
import InterviewSchedulesCalendarView, {
  InterviewDateGroup,
} from '@/src/components/recruiter/interview-schedules/InterviewSchedulesCalendarView'
import InterviewSchedulesListView from '@/src/components/recruiter/interview-schedules/InterviewSchedulesListView'

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getInterviewTime(app: ApplicationDetailResponse) {
  return app.interviewDateTime || app.candidatePreferredInterviewDateTime
}

function groupInterviewsByDate(interviews: ApplicationDetailResponse[]): InterviewDateGroup[] {
  const groups = new Map<string, ApplicationDetailResponse[]>()

  interviews.forEach((interview) => {
    const key = getDateKey(getInterviewTime(interview))
    const items = groups.get(key) ?? []
    items.push(interview)
    groups.set(key, items)
  })

  return Array.from(groups.entries())
    .sort(([dateA], [dateB]) => {
      if (dateA === 'no-date') return 1
      if (dateB === 'no-date') return -1
      return dateA.localeCompare(dateB)
    })
    .map(([key, items]) => ({
      key,
      label: getDateLabel(key),
      items: items.sort((a, b) => {
        const timeA = new Date(getInterviewTime(a) || 0).getTime()
        const timeB = new Date(getInterviewTime(b) || 0).getTime()
        return timeA - timeB
      }),
    }))
}

function getWarning(app: ApplicationDetailResponse) {
  const now = Date.now()
  const interviewTime = app.interviewDateTime ? new Date(app.interviewDateTime).getTime() : null

  if ((app.status as string) === 'RESCHEDULE_REQUESTED' || app.candidatePreferredInterviewDateTime != null) {
    return {
      label: 'Candidate yêu cầu đổi lịch',
      className: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    }
  }

  if ((app.status as string) === 'SLOTS_SENT' || (app.status === ApplicationStatus.INTERVIEW && !app.interviewDateTime)) {
    return {
      label: 'Đang chờ candidate phản hồi',
      className: 'bg-orange-50 text-orange-700 border-orange-100',
    }
  }

  if (app.status === ApplicationStatus.INTERVIEW && interviewTime) {
    const diffHours = (interviewTime - now) / (1000 * 60 * 60)
    if (diffHours < 0) {
      return {
        label: 'Đã qua giờ phỏng vấn, cần cập nhật kết quả',
        className: 'bg-rose-50 text-rose-700 border-rose-100',
      }
    }
    if (diffHours <= 24) {
      return {
        label: 'Sắp đến giờ phỏng vấn',
        className: 'bg-amber-50 text-amber-700 border-amber-100',
      }
    }
  }

  return {
    label: 'Đã lên lịch',
    className: 'bg-slate-50 text-slate-600 border-slate-100',
  }
}

function matchesDateFilter(app: ApplicationDetailResponse, filter: DateFilter) {
  if (filter === 'all') return true
  const time = getInterviewTime(app)
  if (!time) return filter === 'no-date'

  const date = dayjs(time)
  const now = dayjs()

  if (filter === 'today') return date.isSame(now, 'day')
  if (filter === 'upcoming') return date.isAfter(now)
  if (filter === 'overdue') return date.isBefore(now)
  return false
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function RecruiterInterviewSchedulesPage() {
  const { user, isInitialized } = useAuthStore()
  const { data: myCompany } = useGetMyCompany(isInitialized && !!user)
  const { data: schedules = [], isLoading } = useGetRecruiterInterviewSchedules(
    myCompany?.id,
    isInitialized && !!user && !!myCompany?.id
  )
  const acceptReschedule = useAcceptCandidateReschedule()
  const rejectReschedule = useRejectCandidateReschedule()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')

  const filteredSchedules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return schedules.filter((app) => {
      const matchesStatus = !statusFilter || app.status === statusFilter
      const matchesSearch =
        !query ||
        app.candidateName?.toLowerCase().includes(query) ||
        app.cvTitle.toLowerCase().includes(query) ||
        app.jobTitle.toLowerCase().includes(query)
      return matchesStatus && matchesSearch && matchesDateFilter(app, dateFilter)
    })
  }, [dateFilter, schedules, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const now = Date.now()
    return {
      total: schedules.length,
      waitingCandidate: schedules.filter(
        (app) => (app.status as string) === 'SLOTS_SENT' || (app.status === ApplicationStatus.INTERVIEW && !app.interviewDateTime)
      ).length,
      rescheduleRequests: schedules.filter(
        (app) => (app.status as string) === 'RESCHEDULE_REQUESTED' || app.candidatePreferredInterviewDateTime != null
      ).length,
      upcoming: schedules.filter(
        (app) =>
          app.status === ApplicationStatus.INTERVIEW &&
          app.interviewDateTime &&
          new Date(app.interviewDateTime).getTime() > now
      ).length,
      needUpdate: schedules.filter(
        (app) =>
          app.status === ApplicationStatus.INTERVIEW &&
          app.interviewDateTime &&
          new Date(app.interviewDateTime).getTime() < now
      ).length,
    }
  }, [schedules])

  const attentionItems = useMemo(
    () => filteredSchedules.filter((app) => getWarning(app).label !== 'Đã lên lịch'),
    [filteredSchedules]
  )

  const calendarGroups = useMemo(
    () => groupInterviewsByDate(filteredSchedules),
    [filteredSchedules]
  )

  const isActionPending = acceptReschedule.isPending || rejectReschedule.isPending

  const handleAcceptReschedule = (applicationId: string) => {
    acceptReschedule.mutate(applicationId, {
      onSuccess: () => toast.success('Đã chấp nhận lịch mới.'),
      onError: (error: unknown) => toast.error(getErrorMessage(error)),
    })
  }

  const handleRejectReschedule = (applicationId: string) => {
    rejectReschedule.mutate(applicationId, {
      onSuccess: () => toast.success('Đã từ chối lịch mới.'),
      onError: (error: unknown) => toast.error(getErrorMessage(error)),
    })
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Quản Lý Lịch Phỏng Vấn</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Theo dõi lịch phỏng vấn, yêu cầu đổi lịch và các buổi cần cập nhật kết quả.
        </p>
      </div>

      {/* Stats Cards */}
      <InterviewSchedulesStats stats={stats} />

      {/* Attention Banner */}
      <InterviewSchedulesAttentionBanner
        attentionItems={attentionItems}
        getWarning={getWarning}
      />

      {/* View Toggle + Filter Bar */}
      <InterviewSchedulesFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content View */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-semibold text-slate-500">Đang tải lịch phỏng vấn...</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 px-6 text-center">
            <CalendarClock className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">
              {schedules.length === 0
                ? 'Chưa có lịch phỏng vấn nào'
                : 'Chưa có lịch phỏng vấn phù hợp.'}
            </p>
          </div>
        ) : viewMode === 'calendar' ? (
          <InterviewSchedulesCalendarView
            calendarGroups={calendarGroups}
            getWarning={getWarning}
            isActionPending={isActionPending}
            onAcceptReschedule={handleAcceptReschedule}
            onRejectReschedule={handleRejectReschedule}
          />
        ) : (
          <InterviewSchedulesListView
            schedules={filteredSchedules}
            getWarning={getWarning}
            isActionPending={isActionPending}
            onAcceptReschedule={handleAcceptReschedule}
            onRejectReschedule={handleRejectReschedule}
          />
        )}
      </div>
    </div>
  )
}
