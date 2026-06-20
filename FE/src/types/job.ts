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

  jobType: string;
  experienceLevel: string;
  status: string;

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
  jobType?: string;
  experienceLevel?: string;
  deadline?: string;
  requirements?: string;
  skills?: JobSkillRequest[];
}