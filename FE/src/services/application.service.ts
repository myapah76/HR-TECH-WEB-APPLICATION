import { api } from '@/src/lib/axios'
import { ApiResponse } from '../types/api'
import {
  ApplicationSummaryResponse,
  ApplicationDetailResponse,
  ApplicationStatus,
  SubmitApplicationRequest,
} from '../types'

export const getMyApplications = async (): Promise<ApplicationSummaryResponse[]> => {
  const response = await api.get<ApiResponse<ApplicationSummaryResponse[]>>('/applications')
  return response.data.data
}

export const getApplicationsByJob = async (jobId: string): Promise<ApplicationSummaryResponse[]> => {
  const response = await api.get<ApiResponse<ApplicationSummaryResponse[]>>(`/applications/jobs/${jobId}`)
  return response.data.data
}

export const getApplicationDetail = async (id: string): Promise<ApplicationDetailResponse> => {
  const response = await api.get<ApiResponse<ApplicationDetailResponse>>(`/applications/${id}`)
  return response.data.data
}

export const updateApplicationStatus = async (
  id: string,
  status: ApplicationStatus
): Promise<ApplicationSummaryResponse> => {
  const response = await api.put<ApiResponse<ApplicationSummaryResponse>>(
    `/applications/${id}/status?status=${status}`
  )
  return response.data.data
}

export const submitApplication = async (request: SubmitApplicationRequest): Promise<ApplicationSummaryResponse> => {
  const response = await api.post<ApiResponse<ApplicationSummaryResponse>>('/applications', request)
  return response.data.data
}

export const withdrawApplication = async (id: string): Promise<void> => {
  await api.put<ApiResponse<void>>(`/applications/${id}/withdraw`)
}
