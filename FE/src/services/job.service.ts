import { api } from '@/src/lib/axios'
import { JobResponse } from '../types/job'
import { ApiResponse } from '../types/api'

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const getSavedJobs = async (page = 0, size = 100): Promise<JobResponse[]> => {
  const response = await api.get<ApiResponse<PageResponse<JobResponse>>>(
    `/saved-jobs?page=${page}&size=${size}`
  )
  return response.data?.data?.content || []
}
