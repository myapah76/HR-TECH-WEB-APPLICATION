import { JobResponse } from './job'
import { JobMatchingStatus } from '../enums/recommendation.enum'

export interface SkillMatchDetail {
  skillName: string
  matchType: string
  requiredLevel: string
  candidateLevel: string
  matchStatus: string
  similarityScore: number
}

export interface AiMatchHistoryResponse {
  id: string
  overallScore: number
  matchGrade: string
  matchedSkills: string[]
  missingSkills: string[]
  skillDetails: SkillMatchDetail[]
  improvementTips: string
  actionPlan: string[]
}

export interface JobRecommendationResponse {
  jobId: string
  jobTitle: string
  companyName: string
  location: string
  salaryMin?: number
  salaryMax?: number
  matchScore: number
  graphScore: number
  embeddingScore: number
  matchGrade: string
  matchedSkills: string[]
  missingSkills: string[]
}

export interface RecommendationResultResponse {
  cvId: string
  recommendedJobs: JobRecommendationResponse[]
}

export interface JobMatchingTaskResponse {
  taskId: string
  status: JobMatchingStatus
  message: string
  progressPercentage: number
  recommendedJobs: JobRecommendationResponse[] | null
}

// --- Component Props ---

export interface AiMatchResultDisplayProps {
  matchScore: AiMatchHistoryResponse
}
