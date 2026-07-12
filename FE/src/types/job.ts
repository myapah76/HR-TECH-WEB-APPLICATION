import { JobStatus, JobType, ExperienceLevel, JobStatusAction } from '@/src/enums/job.enum';
export { JobStatus, JobType, ExperienceLevel };
export type { JobStatusAction };

export interface JobSkill {
  id: string;
  skillNeo4jId: string;
  skillName: string;
  requiredLevel: string;
  isAiExtracted: boolean;
}

export interface Job {
  id: string;

  companyId: string;
  companyName: string;
  companyLogoUrl: string;

  createdById: string;
  createdByName: string;

  title: string;
  description: string;

  location: string;

  salaryMin: number;
  salaryMax: number;

  jobType: JobType;
  experienceLevel: ExperienceLevel;
  status: JobStatus;

  deadline: string;

  requirements: string;

  extractionStatus: string;

  skills: JobSkill[];

  createdAt: string;
  updatedAt: string;
}

export type JobResponse = Job;

export interface JobSkillRequest {
  skillNeo4jId: string;
  requiredLevel?: string;
}

export interface CreateJobRequest {
  companyId: string;
  title: string;
  description?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string; // Payload can still accept string for flexibility
  experienceLevel?: string; // Payload can still accept string for flexibility
  deadline?: string;
  requirements?: string;
  skills?: JobSkillRequest[];
}

export interface ManageJobsParams {
  status?: string
  jobType?: string
  experienceLevel?: string
  page?: number
  size?: number
}


export interface JobSearchParams {
  keyword?: string
  location?: string
  jobType?: string
  experienceLevel?: string
  salaryMin?: number
  salaryMax?: number
  skills?: string[]
  page?: number
  size?: number
  sort?: string
}

export interface HotPosition {
  name: string
  jobCount: number
}

export interface LandingStatsResponse {
  totalJobs: number
  totalCompanies: number
  totalApplications: number
  trendingSkills: { name: string; jobCount: number }[]
  topCompanies: { id: string; name: string; logoUrl: string; activeJobsCount: number }[]
  hotPositions: HotPosition[]
}