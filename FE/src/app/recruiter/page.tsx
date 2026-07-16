'use client'

import StatCard from '@/src/components/ui/StatCard'
import { Briefcase, Users, Inbox, Calendar } from 'lucide-react'
import {
  useGetRecruiterDashboardSummary,
  useGetRecruiterUpcomingInterviews,
  useGetRecruiterActiveJobs,
  useGetRecruiterAnalytics,
} from '@/src/hooks/company'

import UpcomingInterviews from '@/components/recruiter/dashboard/UpcomingInterviews'
import ActiveJobsList from '@/components/recruiter/dashboard/ActiveJobsList'
import ApplicationAnalyticsChart from '@/components/recruiter/dashboard/ApplicationAnalyticsChart'
import HiringPipelineFunnel from '@/components/recruiter/dashboard/HiringPipelineFunnel'

export default function RecruiterDashboardPage() {
  const { data: summary, isLoading: isSummaryLoading } = useGetRecruiterDashboardSummary()
  const { data: upcomingInterviews = [], isLoading: isInterviewsLoading } =
    useGetRecruiterUpcomingInterviews()
  const { data: activeJobs = [], isLoading: isActiveJobsLoading } = useGetRecruiterActiveJobs()
  const { data: analytics, isLoading: isAnalyticsLoading } = useGetRecruiterAnalytics()

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase}
          label="Tin tuyển dụng"
          value={summary?.activeJobsCount ?? 0}
          color="blue"
          isLoading={isSummaryLoading}
          href="/recruiter/manage-jobs"
        />
        <StatCard
          icon={Users}
          label="Tổng đơn ứng tuyển"
          value={summary?.totalApps ?? 0}
          color="emerald"
          isLoading={isSummaryLoading}
          href="/recruiter/applications"
        />
        <StatCard
          icon={Inbox}
          label="Đơn ứng tuyển mới"
          value={summary?.submittedAppsCount ?? 0}
          color="amber"
          isLoading={isSummaryLoading}
          href="/recruiter/applications"
        />
        <StatCard
          icon={Calendar}
          label="Lịch hẹn phỏng vấn"
          value={summary?.interviewAppsCount ?? 0}
          color="violet"
          isLoading={isSummaryLoading}
          href="/recruiter/applications"
        />
      </div>

      {/* Row 1: Upcoming Interviews & Active Jobs (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingInterviews interviews={upcomingInterviews} isLoading={isInterviewsLoading} />
        <ActiveJobsList activeJobs={activeJobs} isLoading={isActiveJobsLoading} />
      </div>

      {/* Row 2: Analytics Chart & Hiring Funnel (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationAnalyticsChart analytics={analytics} isLoading={isAnalyticsLoading} />
        <HiringPipelineFunnel
          submitted={summary?.submittedAppsCount ?? 0}
          screening={summary?.screeningAppsCount ?? 0}
          interview={summary?.interviewAppsCount ?? 0}
          offer={summary?.offerAppsCount ?? 0}
          totalApps={summary?.totalApps ?? 0}
          isLoading={isSummaryLoading}
        />
      </div>
    </div>
  )
}
