'use client'

import { useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  List,
  Link as LinkIcon,
  Loader2,
  MapPin,
  UserRoundX,
} from 'lucide-react'
import SearchInput from '@/src/components/common/SearchInput'
import FilterSelect from '@/src/components/common/FilterSelect'
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
import { formatDateTime, formatTimeOnly, getDateKey, getDateLabel, getErrorMessage } from '@/src/utils'
import { STATUS_CONFIG, StatusBadge } from '@/src/components/recruiter/applications/ApplicationRow'
import InterviewQuickActions from '@/src/components/recruiter/interview-schedules/InterviewQuickActions'

const INTERVIEW_STATUSES = [
  ApplicationStatus.PENDING_INTERVIEW_SCHEDULE,
  ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.INTERVIEW_COMPLETED,
  ApplicationStatus.NO_SHOW,
]

type DateFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'no-date'
type ViewMode = 'calendar' | 'list'

type InterviewDateGroup = {
  key: string
  label: string
  items: ApplicationDetailResponse[]
}

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả thời gian' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'upcoming', label: 'Sắp tới' },
  { value: 'overdue', label: 'Đã qua giờ' },
  { value: 'no-date', label: 'Chưa có thời gian' },
]

// ─── Pure helpers (không phụ thuộc state/props) ──────────────────────────────

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

  if (app.status === ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE) {
    return {
      label: 'Candidate yêu cầu đổi lịch',
      className: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    }
  }

  if (app.status === ApplicationStatus.PENDING_INTERVIEW_SCHEDULE) {
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
  // "Sắp tới" = tương lai thực sự (> now), không bao gồm đúng thời điểm hiện tại
  if (filter === 'upcoming') return date.isAfter(now)
  if (filter === 'overdue') return date.isBefore(now)
  return false
}

function DetailLine({ icon: Icon, text }: { icon: typeof MapPin; text?: string }) {
  if (!text) return null
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
      <Icon className="h-3.5 w-3.5 text-slate-400" />
      {text}
    </p>
  )
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
        (app) => app.status === ApplicationStatus.PENDING_INTERVIEW_SCHEDULE
      ).length,
      rescheduleRequests: schedules.filter(
        (app) => app.status === ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE
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

  // Memo hoá để tránh tính lại mỗi render
  const attentionItems = useMemo(
    () => filteredSchedules.filter((app) => getWarning(app).label !== 'Đã lên lịch'),
    [filteredSchedules]
  )

  const calendarGroups = useMemo(
    () => groupInterviewsByDate(filteredSchedules),
    [filteredSchedules]
  )

  const isActionPending =
    acceptReschedule.isPending || rejectReschedule.isPending

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {[
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
        ].map((stat) => (
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

      {/* Attention banner */}
      {attentionItems.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-black text-amber-800">
              <AlertCircle className="h-4 w-4" />
              Cần xử lý
            </h2>
            <span className="text-xs font-black text-amber-700">{attentionItems.length} mục</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {attentionItems.slice(0, 6).map((app) => {
              const warning = getWarning(app)
              return (
                <span
                  key={app.id}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${warning.className}`}
                >
                  {warning.label} · {app.candidateName || app.cvTitle}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* View toggle + filters */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-xs">
        <div className="mb-3 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {[
            { value: 'calendar' as const, label: 'Lịch', icon: CalendarClock },
            { value: 'list' as const, label: 'Danh sách', icon: List },
          ].map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setViewMode(mode.value)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black transition ${
                viewMode === mode.value
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <mode.icon className="h-4 w-4" />
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm theo candidate/CV hoặc vị trí..."
            className="flex-1"
          />

          <FilterSelect
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as ApplicationStatus | '')}
            icon={Filter}
            placeholder="Tất cả trạng thái phỏng vấn"
            options={INTERVIEW_STATUSES.map((s) => ({ value: s, label: STATUS_CONFIG[s].label }))}
            className="lg:w-72"
          />

          <FilterSelect
            value={dateFilter}
            onChange={(v) => setDateFilter(v as DateFilter)}
            icon={CalendarClock}
            options={DATE_FILTER_OPTIONS}
            className="lg:w-56"
          />
        </div>
      </div>

      {/* Content */}
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
          <div className="space-y-4 p-4">
            {calendarGroups.map((group) => (
              <section
                key={group.key}
                className="rounded-2xl border border-slate-200/70 bg-slate-50/60 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
                  <h2 className="flex items-center gap-2 text-sm font-black text-slate-800">
                    <CalendarClock className="h-4 w-4 text-emerald-600" />
                    {group.label}
                  </h2>
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                    {group.items.length} lịch
                  </span>
                </div>

                <div className="grid gap-3 p-4 xl:grid-cols-2">
                  {group.items.map((app) => {
                    const warning = getWarning(app)
                    return (
                      <article
                        key={app.id}
                        className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xs"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-3 min-w-0">
                            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-700">
                              {formatTimeOnly(getInterviewTime(app))}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-900">
                                {app.candidateName || app.cvTitle}
                              </p>
                              <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                                {app.jobTitle}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <StatusBadge status={app.status} />
                                <span
                                  className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold ${warning.className}`}
                                >
                                  {warning.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1">
                          <DetailLine icon={MapPin} text={app.interviewLocation} />
                          {app.interviewMeetingLink && (
                            <a
                              href={app.interviewMeetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                            >
                              <LinkIcon className="h-3.5 w-3.5" />
                              Meeting link
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <DetailLine icon={Clock} text={app.interviewNote} />
                        </div>

                        {app.status ===
                          ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE && (
                          <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                            {app.interviewDateTime && (
                              <p className="text-xs font-semibold text-slate-600">
                                Lịch cũ: {formatDateTime(app.interviewDateTime)}
                              </p>
                            )}
                            {app.candidatePreferredInterviewDateTime && (
                              <p className="mt-1 text-xs font-black text-cyan-700">
                                Candidate đề xuất:{' '}
                                {formatDateTime(app.candidatePreferredInterviewDateTime)}
                              </p>
                            )}
                            {app.candidateInterviewResponseMessage && (
                              <p className="mt-1 text-xs font-semibold text-slate-600">
                                Lý do: {app.candidateInterviewResponseMessage}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <InterviewQuickActions
                            app={app}
                            compact
                            isPending={isActionPending}
                            onAcceptReschedule={handleAcceptReschedule}
                            onRejectReschedule={handleRejectReschedule}
                          />
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                    Candidate / CV
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                    Vị trí
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                    Lịch phỏng vấn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                    Cảnh báo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSchedules.map((app) => {
                  const warning = getWarning(app)
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 align-top">
                        <p className="text-sm font-black text-slate-800">
                          {app.candidateName || app.cvTitle}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          CV: {app.cvTitle}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="text-sm font-bold text-slate-700">{app.jobTitle}</p>
                      </td>
                      <td className="px-4 py-4 align-top min-w-64">
                        <p className="text-sm font-black text-slate-800">
                          {app.interviewDateTime
                            ? formatDateTime(app.interviewDateTime)
                            : 'Chưa có lịch chính thức'}
                        </p>
                        <div className="mt-2 space-y-1">
                          <DetailLine icon={MapPin} text={app.interviewLocation} />
                          {app.interviewMeetingLink && (
                            <a
                              href={app.interviewMeetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                            >
                              <LinkIcon className="h-3.5 w-3.5" />
                              Meeting link
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <DetailLine icon={Clock} text={app.interviewNote} />
                        </div>
                        {app.candidatePreferredInterviewDateTime && (
                          <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                            <p className="text-xs font-black text-cyan-700">Candidate đề xuất</p>
                            <p className="mt-1 text-xs font-bold text-slate-700">
                              {formatDateTime(app.candidatePreferredInterviewDateTime)}
                            </p>
                            {app.candidateInterviewResponseMessage && (
                              <p className="mt-1 text-xs font-semibold text-slate-600">
                                Lý do: {app.candidateInterviewResponseMessage}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex rounded-xl border px-3 py-1.5 text-xs font-bold ${warning.className}`}
                        >
                          {warning.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-col gap-2 min-w-44">
                          <InterviewQuickActions
                            app={app}
                            isPending={isActionPending}
                            onAcceptReschedule={handleAcceptReschedule}
                            onRejectReschedule={handleRejectReschedule}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
