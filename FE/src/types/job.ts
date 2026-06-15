export interface JobResponse {
  id: string;
  title: string;
  companyName: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  createdAt: string;
}

export interface SavedJobResponse {
  id: string; // The saved job ID mapping
  job: JobResponse;
  savedAt: string;
}
