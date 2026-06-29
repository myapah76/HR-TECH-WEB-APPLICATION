import { ApplicationStatus } from '../enums/application.enum';
export { ApplicationStatus };
export interface ApplicationSummaryResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  cvId: string;
  cvTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  interviewDateTime?: string;
}

export interface ApplicationDetailResponse {
  id: string;
  jobId: string;
  jobTitle: string;
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

// --- Component Props ---

export interface ApplicationMatchModalProps {
  isOpen: boolean
  onClose: () => void
  cvId: string
  jobId: string
  jobTitle: string
  companyName: string
}
