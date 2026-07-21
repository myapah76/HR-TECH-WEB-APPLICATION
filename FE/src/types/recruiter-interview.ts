// ─── Recruiter Multi-Round & Multi-Slot Interview Types ────────────────────────

export interface AvailableSlot {
  id: string
  startTime: string
  endTime: string
  location?: string
  meetingLink?: string
}

export interface InterviewRoundConfig {
  id?: string
  roundNumber: number
  roundName: string
  description?: string
  interviewerRole?: string
}

export interface JobInterviewRoundResponse {
  id: string
  jobId: string
  roundNumber: number
  roundName: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface JobInterviewRoundRequest {
  roundName: string
  description?: string
}

import { InterviewRoundStatusType, InterviewRoundStatus as InterviewRoundStatusEnum } from '@/src/enums/interview.enum'
export type InterviewRoundStatus = InterviewRoundStatusType
export { InterviewRoundStatusEnum }

export interface InterviewRoundDetail {
  id: string
  applicationId: string
  candidateName: string
  jobTitle: string
  roundNumber: number
  roundName: string
  status: InterviewRoundStatus
  scheduledTime?: string
  slots?: AvailableSlot[]
  rescheduleCount: number
  feedbackNote?: string
  rating?: number
}

export interface ScheduleMultiSlotRequest {
  applicationIds: string[]
  roundNumber: number
  slots: { startTime: string; endTime: string; location?: string; meetingLink?: string }[]
  note?: string
}

export interface SubmitRoundFeedbackRequest {
  applicationId: string
  roundNumber: number
  passed: boolean
  feedbackNote: string
  rating?: number
}
