import { api } from '@/src/lib/axios'
import {
  RecommendationResultResponse,
  JobRecommendationResponse,
  AiMatchHistoryResponse,
  JobMatchingTaskResponse,
  CandidateRecommendationResponse,
} from '../types/recommendation'
import { ApiResponse } from '../types/api'

export const analyzeCvAndRecommend = async (
  cvId: string,
  limit = 10
): Promise<RecommendationResultResponse> => {
  const response = await api.post<ApiResponse<RecommendationResultResponse>>(
    `/recommendations/cvs/${cvId}/analyze?limit=${limit}`
  )
  return response.data.data
}

export const recommendJobsForCv = async (
  cvId: string,
  limit = 10
): Promise<JobRecommendationResponse[]> => {
  const response = await api.get<ApiResponse<JobRecommendationResponse[]>>(
    `/recommendations/jobs?cvId=${cvId}&limit=${limit}`
  )
  return response.data.data
}


export const performPremiumAiMatch = async (
  cvId: string,
  jobId: string
): Promise<AiMatchHistoryResponse> => {
  const response = await api.post<ApiResponse<AiMatchHistoryResponse>>(
    `/recommendations/premium-ai-match?cvId=${cvId}&jobId=${jobId}`
  )
  return response.data.data
}

export const startJobMatching = async (cvId: string): Promise<{ taskId: string }> => {
  const response = await api.post<ApiResponse<{ taskId: string }>>(`/recommendations/start-job-matching/${cvId}`)
  return response.data.data
}

export const getJobMatchingStatus = async (taskId: string): Promise<JobMatchingTaskResponse> => {
  const response = await api.get<ApiResponse<JobMatchingTaskResponse>>(
    `/recommendations/job-matching-status/${taskId}`
  )
  return response.data.data
}

export const recommendCandidatesForJob = async (
  jobId: string
): Promise<CandidateRecommendationResponse[]> => {
  const response = await api.get<ApiResponse<CandidateRecommendationResponse[]>>(
    `/recommendations/hr/candidates?jobId=${jobId}`
  )
  return response.data.data
}
