import { api } from '@/lib/axios'
import { CandidateSummaryResponse, RecentActivityItem, UpcomingInterviewItem, JobSearchAnalyticsResponse } from '@/types'
import { ApiResponse } from '@/types/api'

export const getCandidateDashboardSummary = async (): Promise<CandidateSummaryResponse> => {
  const res = await api.get<ApiResponse<CandidateSummaryResponse>>('/candidates/dashboard-summary')
  return res.data.data
}

export const getRecentActivities = async (limit = 5): Promise<RecentActivityItem[]> => {
  const res = await api.get<ApiResponse<RecentActivityItem[]>>('/candidates/recent-activities', {
    params: { limit },
  })
  return res.data.data
}

export const getUpcomingInterviews = async (): Promise<UpcomingInterviewItem[]> => {
  const res = await api.get<ApiResponse<UpcomingInterviewItem[]>>('/candidates/upcoming-interviews')
  return res.data.data
}

export const getJobSearchAnalytics = async (): Promise<JobSearchAnalyticsResponse> => {
  const res = await api.get<ApiResponse<JobSearchAnalyticsResponse>>('/candidates/job-search-analytics')
  return res.data.data
}

