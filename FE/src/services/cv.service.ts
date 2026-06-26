import { api } from '@/src/lib/axios'
import { CvSummaryResponse, CvDetailResponse, UploadCvRequest } from '@/src/types/cv'
import { ApiResponse } from '@/src/types/api'

export const getAllCvs = async (): Promise<ApiResponse<CvSummaryResponse[]>> => {
  const response = await api.get('/cvs')
  return response.data
}

export const getCvDetail = async (cvId: string): Promise<ApiResponse<CvDetailResponse>> => {
  const response = await api.get(`/cvs/${cvId}`)
  return response.data
}

export const uploadCv = async (
  request: UploadCvRequest
): Promise<ApiResponse<CvSummaryResponse>> => {
  const response = await api.post('/cvs', request)
  return response.data
}

export const setPrimaryCv = async (cvId: string): Promise<ApiResponse<CvSummaryResponse>> => {
  const response = await api.put(`/cvs/${cvId}/primary`)
  return response.data
}

export const deleteCv = async (cvId: string): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/cvs/${cvId}`)
  return response.data
}

export const updateCvTitle = async (
  id: string,
  title: string
): Promise<ApiResponse<CvSummaryResponse>> => {
  const response = await api.put(`/cvs/${id}/title`, { title })
  return response.data
}
