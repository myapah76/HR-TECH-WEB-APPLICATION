import { ApplicationStatus } from '../enums/application.enum';
export { ApplicationStatus };
export interface ApplicationInterviewRoundResponse {
  id: string;
  applicationId: string;
  roundNumber: number;
  roundName: string;
  status: string;
  scheduledTime?: string;
  location?: string;
  meetingLink?: string;
  candidatePreferredTime?: string;
  candidateRescheduleReason?: string;
  hrRejectionReason?: string;
  rescheduleCount?: number;
  feedbackNote?: string;
  rating?: number;
  attendedAt?: string;
  slots?: Array<{
    id: string;
    startTime: string;
    endTime: string;
    location?: string;
    meetingLink?: string;
    isSelected?: boolean;
    isNewSlot?: boolean;
  }>;
}

export interface ApplicationSummaryResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName?: string;
  cvId: string;
  cvTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  interviewDateTime?: string;
  candidatePreferredInterviewDateTime?: string;
  rescheduleCount?: number;
  candidatePreferredTime?: string;
  candidateRescheduleReason?: string;
  scheduledTime?: string;
  overallScore?: number;
  grade?: string;
  interviewRoundStatus?: string;
  interviewRounds?: ApplicationInterviewRoundResponse[];
}

export interface ApplicationDetailResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName?: string;
  companyName?: string;
  companyAddress?: string;
  cvId: string;
  cvTitle: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
  interviewDateTime?: string;
  interviewLocation?: string;
  interviewMeetingLink?: string;
  interviewNote?: string;
  candidateInterviewResponseMessage?: string;
  candidatePreferredInterviewDateTime?: string;
  overallScore?: number;
  grade?: string;
  aiSummary?: string;
  aiSuggestion?: string;
}

export interface SubmitApplicationRequest {
  jobId: string;
  cvId: string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  acceptedStartDateTime?: string;
  acceptedWorkAddress?: string;
  acceptedNote?: string;
}

export interface ScheduleInterviewRequest {
  interviewDateTime: string;
  interviewLocation?: string;
  interviewMeetingLink?: string;
  note?: string;
}

export interface RejectInterviewScheduleRequest {
  preferredInterviewDateTime: string;
  reason: string;
}

export interface ChangeInterviewScheduleRequest {
  candidatePreferredInterviewDateTime: string;
  reason: string;
}

// --- Component Props ---

export interface ApplicationMatchModalProps {
  isOpen: boolean
  onClose: () => void
  cvId: string
  jobId: string
  jobTitle: string
  companyName: string
}

// --- Bulk Scoring ---

export interface BulkScoreRequest {
  thresholdPercent: number
  autoRejectBelowThreshold: boolean
}

export interface BulkScoreResponse {
  totalScored: number
  autoRejectedCount: number
  aboveThresholdCount: number
  alreadyScoredCount: number
  failedCount: number
  allApplications: ApplicationSummaryResponse[]
}
