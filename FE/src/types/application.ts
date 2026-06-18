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

export interface SubmitApplicationRequest {
  jobId: string;
  cvId: string;
  coverLetter?: string;
}
