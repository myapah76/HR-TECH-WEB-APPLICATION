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

// --- Component Props ---

export interface ApplicationMatchModalProps {
  isOpen: boolean
  onClose: () => void
  cvId: string
  jobId: string
  jobTitle: string
  companyName: string
}
