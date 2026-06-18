import { api } from '@/src/lib/axios'
import { ApiResponse } from '../types/api'
import { ApplicationSummaryResponse, SubmitApplicationRequest } from '../types'

export const getMyApplications = async (): Promise<ApplicationSummaryResponse[]> => {
  const response = await api.get<ApiResponse<ApplicationSummaryResponse[]>>('/applications')
  return response.data.data
}

export const submitApplication = async (request: SubmitApplicationRequest): Promise<ApplicationSummaryResponse> => {
  const response = await api.post<ApiResponse<ApplicationSummaryResponse>>('/applications', request)
  return response.data.data
}

export const withdrawApplication = async (id: string): Promise<void> => {
  await api.put<ApiResponse<void>>(`/applications/${id}/withdraw`)
}
