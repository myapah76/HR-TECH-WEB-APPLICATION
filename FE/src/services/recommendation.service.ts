import { api } from '@/src/lib/axios'
import {
  RecommendationResultResponse,
  JobRecommendationResponse,
  SkillMatchScoreResponse,
  JobMatchingTaskResponse,
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

export const calculateMatchScore = async (
  cvId: string,
  jobId: string
): Promise<SkillMatchScoreResponse> => {
  const response = await api.get<ApiResponse<SkillMatchScoreResponse>>(
    `/recommendations/match-score?cvId=${cvId}&jobId=${jobId}`
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
