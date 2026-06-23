export type ApplicationStatus =
  | 'SUBMITTED'
  | 'SCREENING'
  | 'SCORED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicationSummaryResponse {
  id: string;
  jobId: string;
  jobTitle: string;
  cvId: string;
  cvTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
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
