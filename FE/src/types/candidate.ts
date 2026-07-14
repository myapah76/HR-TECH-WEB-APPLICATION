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
