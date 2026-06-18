import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'

export interface SubmitApplicationRequest {
  jobId: string
  cvId: string
  coverLetter?: string
}

export interface ApplicationSummaryResponse {
  id: string
  jobId: string
  jobTitle: string
  companyName: string
  cvId: string
  cvTitle: string
  coverLetter?: string
  status: string
  createdAt: string
}

export const submitApplication = async (
  request: SubmitApplicationRequest
): Promise<ApplicationSummaryResponse> => {
  const response = await api.post<ApiResponse<ApplicationSummaryResponse>>('/applications', request)
  return response.data.data
}

export const getMyApplications = async (): Promise<ApplicationSummaryResponse[]> => {
  const response = await api.get<ApiResponse<ApplicationSummaryResponse[]>>('/applications')
  return response.data.data || []
}
