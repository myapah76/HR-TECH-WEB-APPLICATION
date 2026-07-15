export interface CandidateSummaryResponse {
  appliedCount: number
  savedCount: number
  cvCount: number
  interviewCount: number
}

export interface RecentActivityItem {
  action: string
  date: string
  status: 'submitted' | 'saved'
}

export interface UpcomingInterviewItem {
  company: string
  position: string
  dateTime: string
  meetUrl?: string
  location?: string
  applicationId?: string
}

export interface FunnelItem {
  stage: string
  count: number
  percent: number
}

export interface ChartItem {
  label: string
  count: number
}

export interface JobSearchAnalyticsResponse {
  funnelData: FunnelItem[]
  weeklyData: ChartItem[]
  monthlyData: ChartItem[]
  yearlyData: ChartItem[]
}

