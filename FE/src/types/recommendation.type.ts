import { JobResponse } from './job.type';

export interface SkillMatchDetail {
  skillName: string;
  matchType: string;
  requiredLevel: string;
  candidateLevel: string;
  matchStatus: string;
  similarityScore: number;
}

export interface SkillMatchScoreResponse {
  overallScore: number;
  grade: string;
  graphScore: number;
  embeddingScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillDetails: SkillMatchDetail[];
}

export interface JobRecommendationResponse {
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  matchScore: number;
  graphScore: number;
  embeddingScore: number;
  matchGrade: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface RecommendationResultResponse {
  cvId: string;
  recommendedJobs: JobRecommendationResponse[];
}

export interface JobMatchingTaskResponse {
  taskId: string;
  status: 'PENDING' | 'EXTRACTING' | 'MAPPING' | 'SCORING' | 'DONE' | 'FAILED';
  message: string;
  progressPercentage: number;
  recommendedJobs: JobRecommendationResponse[] | null;
}
