import { api } from '@/src/lib/axios'
import { CvSummaryResponse, CvDetailResponse, UploadCvRequest } from '@/src/types/cv'
import { ApiResponse } from '@/src/types/api'

export const getAllCvs = async (): Promise<CvSummaryResponse[]> => {
  const response = await api.get<ApiResponse<CvSummaryResponse[]>>('/cvs')
  return response.data.data
}

export const getCvDetail = async (cvId: string): Promise<CvDetailResponse> => {
  const response = await api.get<ApiResponse<CvDetailResponse>>(`/cvs/${cvId}`)
  return response.data.data
}

export const uploadCv = async (request: UploadCvRequest): Promise<CvSummaryResponse> => {
  const response = await api.post<ApiResponse<CvSummaryResponse>>('/cvs', request)
  return response.data.data
}

export const setPrimaryCv = async (cvId: string): Promise<CvSummaryResponse> => {
  const response = await api.put<ApiResponse<CvSummaryResponse>>(`/cvs/${cvId}/primary`)
  return response.data.data
}

export const deleteCv = async (cvId: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/cvs/${cvId}`)
}

export const updateCvTitle = async (id: string, title: string): Promise<CvSummaryResponse> => {
  const response = await api.put<ApiResponse<CvSummaryResponse>>(`/cvs/${id}/title`, { title })
  return response.data.data
}
