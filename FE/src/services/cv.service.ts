import { api } from '@/src/lib/axios'
import { CvSummaryResponse, CvDetailResponse } from '../types/cv'
import { ApiResponse } from '../types/api'

export const getAllCvs = async (): Promise<CvSummaryResponse[]> => {
  const response = await api.get<ApiResponse<CvSummaryResponse[]>>('/cvs')
  return response.data.data
}

export const getCvDetail = async (cvId: string): Promise<CvDetailResponse> => {
  const response = await api.get<ApiResponse<CvDetailResponse>>(`/cvs/${cvId}`)
  return response.data.data
}

export const uploadCv = async (file: File, title: string): Promise<CvSummaryResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)

  const response = await api.post<ApiResponse<CvSummaryResponse>>('/cvs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
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
