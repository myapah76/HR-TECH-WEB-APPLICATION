import { Job, JobResponse } from '@/src/types/job'
import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export const getSavedJobs = async (page = 0, size = 100): Promise<JobResponse[]> => {
  const response = await api.get<ApiResponse<PageResponse<JobResponse>>>(
    `/saved-jobs?page=${page}&size=${size}`
  )
  return response.data?.data?.content || []
}

export const getJobs = async (page = 0, size = 10): Promise<PageResponse<Job>> => {
  const response = await api.get(`/jobs/list?page=${page}&size=${size}`)

  return response.data.data
}
