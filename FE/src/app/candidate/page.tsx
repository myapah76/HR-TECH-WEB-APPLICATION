'use client'

import StatCard from '@/src/components/ui/StatCard'
import { Heart, Send, FileText, Calendar } from 'lucide-react'
import { useGetCandidateSummary } from '@/src/hooks/candidate/useGetCandidateSummary'
import UpcomingInterviews from '@/src/components/candidate/dashboard/UpcomingInterviews'
import JobSearchAnalytics from '@/src/components/candidate/dashboard/JobSearchAnalytics'
import RecentActivity from '@/src/components/candidate/dashboard/RecentActivity'
import ProfileCompleteness from '@/src/components/candidate/dashboard/ProfileCompleteness'

export default function CandidateDashboardPage() {
  const { data: summary, isLoading: isSummaryLoading } = useGetCandidateSummary()

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Send}
          label="Đã ứng tuyển"
          value={summary?.appliedCount ?? 0}
          color="blue"
          isLoading={isSummaryLoading}
          href="/candidate/applied-jobs"
        />
        <StatCard
          icon={Heart}
          label="Việc đã lưu"
          value={summary?.savedCount ?? 0}
          color="rose"
          isLoading={isSummaryLoading}
          href="/candidate/saved-jobs"
        />
        <StatCard
          icon={FileText}
          label="CV của tôi"
          value={summary?.cvCount ?? 0}
          color="emerald"
          isLoading={isSummaryLoading}
          href="/candidate/cv"
        />
        <StatCard
          icon={Calendar}
          label="Lịch phỏng vấn"
          value={summary?.interviewCount ?? 0}
          color="violet"
          isLoading={isSummaryLoading}
          href="/candidate/applied-jobs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <RecentActivity />

        <UpcomingInterviews />

        <ProfileCompleteness />
      </div>

      <JobSearchAnalytics />
    </div>
  )
}
